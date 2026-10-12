export const withoutEmptyCode = <T extends { code?: string }>(doc: T): T => ({
  ...doc,
  code: doc.code?.trim() || undefined,
});
