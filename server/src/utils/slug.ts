import { randomBytes } from 'node:crypto';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function uniqueSlug(input: string): string {
  const base = slugify(input) || 'item';
  const suffix = randomBytes(4).toString('hex').slice(0, 5);
  return `${base}-${suffix}`;
}
