export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const uniqueSlug = (
  base: string,
  existing: ReadonlyArray<string>,
): string => {
  const seed = slugify(base) || 'page';
  if (!existing.includes(seed)) return seed;
  let n = 2;
  while (existing.includes(`${seed}-${n}`)) n++;
  return `${seed}-${n}`;
};
