import { z } from 'zod';

export const parseReportRecords = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    const parsed = z.record(z.unknown()).safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
};
