/**
 * ============================================================================
 *  ACESSO AO RUNTIME DA CLOUDFLARE — SÓ NO SERVIDOR
 * ============================================================================
 *  Bindings (KV) e segredos do Worker. Não importe isto em componente de
 *  cliente: segredo não pode ir para o navegador.
 *
 *  O módulo `cloudflare:workers` só existe dentro do Worker. Em `next dev` a
 *  importação falha e cada função cai no seu plano B, descrito abaixo.
 * ============================================================================
 */

/** Binding do KV do site, declarado em `wrangler.jsonc`. */
const KV_BINDING = 'ROGAN_KV';

/** Os métodos do KV da Cloudflare que o site usa. */
export interface KVStore {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number; expiration?: number; metadata?: unknown },
  ): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number; metadata?: unknown }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

/** Bindings do Worker, ou `null` fora dele. */
async function workerEnv(): Promise<Record<string, unknown> | null> {
  try {
    const { env } = await import('cloudflare:workers');
    return env ?? null;
  } catch {
    return null;
  }
}

/** O KV real da Cloudflare, ou `null` se o binding não existir. */
export async function getKV(): Promise<KVStore | null> {
  const env = await workerEnv();
  const binding = env?.[KV_BINDING];
  return binding ? (binding as KVStore) : null;
}

/**
 * Onde guardar estado que precisa sobreviver entre requisições.
 *
 * - No Worker, com o binding: o KV real.
 * - Em desenvolvimento, sem binding: um KV em memória, para dar para testar o
 *   fluxo inteiro com `npm run dev`. Some ao reiniciar o servidor.
 * - Em produção, sem binding: `null`. Quem chama tem que falhar em voz alta —
 *   memória em produção seria pior que erro, porque cada instância do Worker
 *   teria a sua e o estado mudaria de uma requisição para outra.
 */
export async function getDataStore(): Promise<KVStore | null> {
  const kv = await getKV();
  if (kv) return kv;
  if (process.env.NODE_ENV === 'production') return null;
  return memoryStore();
}

/**
 * Segredo do Worker (`wrangler secret put NOME`) ou variável de ambiente.
 *
 * Sem valor de reserva de propósito: um segredo "padrão de desenvolvimento"
 * esquecido em produção abriria o endpoint para qualquer um.
 */
export async function getSecret(name: string): Promise<string | null> {
  const env = await workerEnv();
  const fromWorker = env?.[name];
  if (typeof fromWorker === 'string' && fromWorker.length > 0) return fromWorker;
  const fromProcess = process.env[name];
  return fromProcess && fromProcess.length > 0 ? fromProcess : null;
}

/* -------------------------------------------------------------------------- */
/*  KV EM MEMÓRIA — SÓ DESENVOLVIMENTO E TESTES                                */
/* -------------------------------------------------------------------------- */

interface MemoryEntry {
  value: string;
  metadata?: unknown;
  /** Em segundos desde 1970, como no KV de verdade. */
  expiration?: number;
}

type MemoryGlobal = typeof globalThis & { __roganMemoryKV?: Map<string, MemoryEntry> };

/**
 * KV em memória com o mesmo comportamento do real: prefixo, metadados e
 * expiração.
 *
 * Fica em `globalThis` porque, em desenvolvimento, cada rota pode carregar a
 * sua própria cópia deste módulo — sem isso o pedido gravado por uma rota
 * seria invisível para a outra.
 */
export function memoryStore(map?: Map<string, MemoryEntry>): KVStore {
  const holder = globalThis as MemoryGlobal;
  const entries = map ?? (holder.__roganMemoryKV ??= new Map());
  const now = () => Math.floor(Date.now() / 1000);

  const alive = (key: string): MemoryEntry | undefined => {
    const entry = entries.get(key);
    if (entry?.expiration !== undefined && entry.expiration <= now()) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  };

  return {
    async get(key) {
      return alive(key)?.value ?? null;
    },
    async put(key, value, options = {}) {
      const expiration =
        options.expiration ?? (options.expirationTtl ? now() + options.expirationTtl : undefined);
      entries.set(key, { value, metadata: options.metadata, expiration });
    },
    async delete(key) {
      entries.delete(key);
    },
    async list(options = {}) {
      const keys = [...entries.keys()]
        .filter((key) => key.startsWith(options.prefix ?? '') && alive(key))
        .sort()
        .map((name) => {
          const entry = entries.get(name) as MemoryEntry;
          return { name, expiration: entry.expiration, metadata: entry.metadata };
        });
      return { keys, list_complete: true };
    },
  };
}
