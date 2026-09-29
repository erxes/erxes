import {
  buildDetailedReportPath,
  getReportGroupsFromAttr,
} from '../reportNavigation';

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
});
