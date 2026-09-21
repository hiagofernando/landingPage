/**
 * ============================================================================
 *  OTIMIZADOR DE FOTOS DA FROTA
 * ============================================================================
 *  Converte as fotos de `public/frota` para WebP em um tamanho adequado ao
 *  site. Use sempre que chegarem fotos novas:
 *
 *      npm run otimizar-fotos
 *
 *  Por que isso importa: o site roda em Cloudflare Workers, onde o otimizador
 *  do `next/image` só funciona com o binding de Cloudflare Images (ver
 *  `imagesOptimizer()` no README do @vinext/cloudflare). Enquanto esse binding
 *  não estiver ligado, o arquivo que está em `public/` é exatamente o que o
 *  visitante baixa — uma foto de celular de 4 MB seria baixada inteira, no 4G.
 *
 *  Requer ImageMagick (comando `magick`) instalado.
 *    Windows: winget install ImageMagick.ImageMagick
 *    Linux:   apt install imagemagick
 * ============================================================================
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Largura máxima. Cobre o hero em tela grande com densidade 2x. */
const LARGURA_MAX = 1400;

/** Qualidade do WebP. 72 é o ponto onde o olho não vê diferença em foto de carro. */
const QUALIDADE = 72;

const ORIGENS = ['.jpg', '.jpeg', '.png'];

const raizPublic = fileURLToPath(new URL('../public/frota/', import.meta.url));

function formatarKB(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

/** Converte um arquivo e devolve quanto economizou. */
function otimizar(caminhoOrigem) {
  const destino = caminhoOrigem.replace(/\.(jpe?g|png)$/i, '.webp');
  const antes = statSync(caminhoOrigem).size;

  execFileSync('magick', [
    caminhoOrigem,
    '-resize',
    `${LARGURA_MAX}x${LARGURA_MAX}>`, // `>` = só reduz, nunca amplia
    '-strip', // remove metadados (inclusive GPS da foto de celular)
    '-quality',
    String(QUALIDADE),
    destino,
  ]);

  const depois = statSync(destino).size;
  return { destino, antes, depois };
}

function percorrer(diretorio) {
  const encontrados = [];
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...percorrer(caminho));
    } else if (ORIGENS.some((extensao) => entrada.name.toLowerCase().endsWith(extensao))) {
      encontrados.push(caminho);
    }
  }
  return encontrados;
}

const arquivos = percorrer(raizPublic);

if (arquivos.length === 0) {
  console.log('Nada para otimizar: nenhum JPG ou PNG em public/frota.');
  process.exit(0);
}

let totalAntes = 0;
let totalDepois = 0;

for (const arquivo of arquivos) {
  const { destino, antes, depois } = otimizar(arquivo);
  totalAntes += antes;
  totalDepois += depois;
  const nome = destino.slice(raizPublic.length).replace(/\\/g, '/');
  console.log(`  ${nome.padEnd(38)} ${formatarKB(antes)} -> ${formatarKB(depois)}`);
}

const economia = Math.round((1 - totalDepois / totalAntes) * 100);
console.log(
  `\n${arquivos.length} foto(s): ${formatarKB(totalAntes)} -> ${formatarKB(totalDepois)} (-${economia}%)`,
);
console.log('Agora apague os arquivos .jpg/.png originais e aponte vehicles.ts para os .webp.');
