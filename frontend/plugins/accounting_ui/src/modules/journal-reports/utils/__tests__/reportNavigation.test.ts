import {
  buildDetailedReportPath,
  getReportGroupsFromAttr,
  getReportPeriodParam,
  REPORT_PERIOD_DEFAULT_TIME,
  setReportPeriodTime,
} from '@/journal-reports/utils/reportNavigation';

describe('journal report drill-down navigation', () => {
  it('keeps the report and adds every grouped-row filter', () => {
    const path = buildDetailedReportPath(
      {
        pathname: '/accounting/gen-journal-report',
        search: '?report=invCost&groupKey=accBranchDep&unhideZero=true',
      },
      'invCost',
      'accountId+account-1*branchId+branch-1*departmentId+department-1,productId+product-1',
    );
    const params = new URLSearchParams(path.split('?')[1]);

    expect(params.get('report')).toBe('invCost');
    expect(params.get('isMore')).toBe('true');
    expect(params.get('groupKey')).toBe('accBranchDep');
    expect(params.get('unhideZero')).toBe('true');
    expect(params.get('accountIds')).toBe('account-1');
    expect(params.get('branchId')).toBe('branch-1');
    expect(params.get('departmentId')).toBe('department-1');
    expect(params.get('productIds')).toBe('product-1');
  });

  it('maps document and date groups to precise detail filters', () => {
    const path = buildDetailedReportPath(
      { pathname: '/report', search: '?report=invSaleDaily' },
      'invSaleDaily',
      'date+2026-09-12T08:15:00.000Z*ptrId+pointer-1',
    );
    const params = new URLSearchParams(path.split('?')[1]);

    expect(params.get('fromDate')).toBe('2026-09-12 00:00:00');
    expect(params.get('toDate')).toBe('2026-09-12 23:59:59.999');
    expect(params.get('ptrId')).toBe('pointer-1');
  });

  it('preserves plus characters inside group ids', () => {
    expect(getReportGroupsFromAttr('contentId+sales:deal+legacy-id')).toEqual([
      { group: 'contentId', id: 'sales:deal+legacy-id' },
    ]);
  });

  const periodParam = (
    key: 'fromDate' | 'toDate',
    day: Date,
    time = REPORT_PERIOD_DEFAULT_TIME[key],
  ) => getReportPeriodParam(key, setReportPeriodTime(day, time));

  it('keeps transactions posted later on the last day picked without a time', () => {
    const pickedDay = new Date(2026, 9, 15);
    const fromDate = new Date(periodParam('fromDate', pickedDay));
    const toDate = new Date(periodParam('toDate', pickedDay));

    expect(new Date(2026, 9, 15, 0, 0) >= fromDate).toBe(true);
    expect(new Date(2026, 9, 15, 23, 59, 59) <= toDate).toBe(true);
  });

  it('limits a cashier shift report to the picked hours', () => {
    const shiftDay = new Date(2026, 9, 15);
    const fromParam = periodParam('fromDate', shiftDay, { hour: 9, minute: 0 });
    const toParam = periodParam('toDate', shiftDay, { hour: 18, minute: 0 });
    const fromDate = new Date(fromParam);
    const toDate = new Date(toParam);

    expect(fromParam).toBe('2026-10-15 09:00:00');
    expect(toParam).toBe('2026-10-15 18:00:59.999');
    expect(new Date(2026, 9, 15, 8, 59) >= fromDate).toBe(false);
    expect(new Date(2026, 9, 15, 18, 0, 40) <= toDate).toBe(true);
    expect(new Date(2026, 9, 15, 18, 1) <= toDate).toBe(false);
  });

  it.each([
    {
      scenario:
        'keeps the shift hours when drilling into a day of a shift report',
      period:
        'fromDate=2026-10-15+09%3A00%3A00&toDate=2026-10-15+18%3A00%3A59.999',
      fromDate: '2026-10-15 09:00:00',
      toDate: '2026-10-15 18:00:59.999',
    },
    {
      scenario:
        'opens the whole day when drilling into a middle day of a timed period',
      period:
        'fromDate=2026-10-14+09%3A00%3A00&toDate=2026-10-16+18%3A00%3A59.999',
      fromDate: '2026-10-15 00:00:00',
      toDate: '2026-10-15 23:59:59.999',
    },
    {
      scenario:
        'falls back to the whole day when the period in the address is broken',
      period: 'fromDate=yesterday&toDate=',
      fromDate: '2026-10-15 00:00:00',
      toDate: '2026-10-15 23:59:59.999',
    },
  ])('$scenario', ({ period, fromDate, toDate }) => {
    const path = buildDetailedReportPath(
      { pathname: '/report', search: `?report=invSaleDaily&${period}` },
      'invSaleDaily',
      'date+2026-10-15T00:00:00.000Z',
    );
    const params = new URLSearchParams(path.split('?')[1]);

    expect(params.get('fromDate')).toBe(fromDate);
    expect(params.get('toDate')).toBe(toDate);
  });

  it('excludes transactions from the day after the selected period', () => {
    const toDate = new Date(periodParam('toDate', new Date(2026, 9, 31)));

    expect(new Date(2026, 10, 1, 0, 0) <= toDate).toBe(false);
  });
});
