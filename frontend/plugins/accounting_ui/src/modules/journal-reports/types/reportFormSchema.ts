import { z } from 'zod';

type Translate = (key: string) => string;

export const getReportPeriodSchema = (t: Translate) => {
  const dateRequired = {
    required_error: t('Date is required'),
    invalid_type_error: t('Date is required'),
  };

  return z
    .object({
      fromDate: z.date(dateRequired),
      toDate: z.date(dateRequired),
    })
    .passthrough()
    .refine(({ fromDate, toDate }) => toDate >= fromDate, {
      path: ['toDate'],
      message: t('end-date-after-start'),
    });
};
