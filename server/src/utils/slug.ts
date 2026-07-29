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
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
