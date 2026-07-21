export const getAutoArchiveDate = (
  enabled: boolean | undefined,
  date: Date | null | undefined,
) => (enabled ? date : null);
