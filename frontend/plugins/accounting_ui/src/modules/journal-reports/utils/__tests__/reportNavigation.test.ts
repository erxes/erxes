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

  it('keeps transactions posted later on the last day picked without a time', () => {
    const pickedDay = new Date(2026, 9, 15);

    const fromDate = new Date(
      getReportPeriodParam(
        'fromDate',
        setReportPeriodTime(pickedDay, REPORT_PERIOD_DEFAULT_TIME.fromDate),
      ),
    );
    const toDate = new Date(
      getReportPeriodParam(
        'toDate',
        setReportPeriodTime(pickedDay, REPORT_PERIOD_DEFAULT_TIME.toDate),
      ),
    );

    expect(new Date(2026, 9, 15, 0, 0) >= fromDate).toBe(true);
    expect(new Date(2026, 9, 15, 23, 59, 59) <= toDate).toBe(true);
  });

  it('limits a cashier shift report to the picked hours', () => {
    const shiftDay = new Date(2026, 9, 15);
    const fromParam = getReportPeriodParam(
      'fromDate',
      setReportPeriodTime(shiftDay, { hour: 9, minute: 0 }),
    );
    const toParam = getReportPeriodParam(
      'toDate',
      setReportPeriodTime(shiftDay, { hour: 18, minute: 0 }),
    );
    const fromDate = new Date(fromParam);
    const toDate = new Date(toParam);

    expect(fromParam).toBe('2026-10-15 09:00:00');
    expect(toParam).toBe('2026-10-15 18:00:59.999');
    expect(new Date(2026, 9, 15, 8, 59) >= fromDate).toBe(false);
    expect(new Date(2026, 9, 15, 18, 0, 40) <= toDate).toBe(true);
    expect(new Date(2026, 9, 15, 18, 1) <= toDate).toBe(false);
  });

  it('keeps the picked time when the day is changed', () => {
    const picked = setReportPeriodTime(new Date(2026, 9, 31, 0, 0), {
      hour: 14,
      minute: 30,
    });

    expect(getReportPeriodParam('toDate', picked)).toBe(
      '2026-10-31 14:30:59.999',
    );
  });

  it('excludes transactions from the day after the selected period', () => {
    const toDate = new Date(
      getReportPeriodParam(
        'toDate',
        setReportPeriodTime(
          new Date(2026, 9, 31),
          REPORT_PERIOD_DEFAULT_TIME.toDate,
        ),
      ),
    );

    expect(new Date(2026, 10, 1, 0, 0) <= toDate).toBe(false);
  });
});
