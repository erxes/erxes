/** Returns the selected archive date, or clears it when auto-archive is off. */
export const getAutoArchiveDate = (
  enabled: boolean | undefined,
  date: Date | null | undefined,
) => (enabled ? date : null);
