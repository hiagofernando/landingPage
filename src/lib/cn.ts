type ClassValue = string | false | null | undefined;

/** Concatenação simples de classes — evita dependência externa. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
