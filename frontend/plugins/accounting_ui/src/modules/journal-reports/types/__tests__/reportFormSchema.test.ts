import { getReportPeriodSchema } from '@/journal-reports/types/reportFormSchema';

const schema = getReportPeriodSchema((key) => key);

const getFieldErrors = (values: Record<string, unknown>) => {
  const result = schema.safeParse(values);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('journal report period validation', () => {
  it('rejects a trial balance submitted with both date pickers left empty', () => {
    expect(getFieldErrors({ groupKey: 'default' })).toEqual({
      fromDate: ['Date is required'],
      toDate: ['Date is required'],
    });
  });

  it('rejects a start date whose end date was cleared back to null', () => {
    expect(
      getFieldErrors({
        fromDate: new Date(2026, 9, 1),
        toDate: null,
      }),
    ).toEqual({ toDate: ['Date is required'] });
  });

  it('rejects an end date picked before the start date', () => {
    expect(
      getFieldErrors({
        fromDate: new Date(2026, 9, 31),
        toDate: new Date(2026, 9, 1),
      }),
    ).toEqual({ toDate: ['end-date-after-start'] });
  });

  it('accepts a single-day period', () => {
    const day = new Date(2026, 9, 15);

    expect(getFieldErrors({ fromDate: day, toDate: day })).toEqual({});
  });

  it('accepts a month and keeps the other report filters for the URL', () => {
    const result = schema.safeParse({
      fromDate: new Date(2026, 9, 1),
      toDate: new Date(2026, 9, 31),
      accountIds: ['account-1'],
      groupKey: 'default',
      isMore: true,
    });

    expect(result.success && result.data).toMatchObject({
      accountIds: ['account-1'],
      groupKey: 'default',
      isMore: true,
    });
  });
});
