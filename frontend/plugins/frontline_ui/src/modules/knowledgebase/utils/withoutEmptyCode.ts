export const withoutEmptyCode = <T extends { code?: string | null }>(
  doc: T,
): T => ({
  ...doc,
  code: doc.code?.trim() || undefined,
});
