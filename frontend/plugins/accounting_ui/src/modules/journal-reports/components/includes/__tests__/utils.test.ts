import { IGroupRule } from '../../../types/reportsMap';
import { shouldKeepZeroRows, totalsCalc } from '../utils';

jest.mock('erxes-ui', () => ({
  displayNum: (value: number) => value.toFixed(2),
}));

const groupRule: IGroupRule = {
  group: 'accountId',
  code: 'accountCode',
  name: 'accountName',
};

const createReportTable = () => {
  document.body.innerHTML = `
    <table data-slot="table">
      <tbody>
        <tr data-sum-key="account+1">
          <td>150401</td><td>Inventory</td><td></td><td></td>
        </tr>
        <tr data-keys="footer,account+1">
          <td>001</td><td>Product</td><td>0.00</td><td>0.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr data-sum-key="footer">
          <td></td><td>Total</td><td></td><td></td>
        </tr>
      </tfoot>
    </table>
  `;

  return document.querySelector('tbody') as HTMLTableSectionElement;
};

describe('totalsCalc zero-row visibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('hides zero-valued parent and leaf rows in a summary report', () => {
    const root = createReportTable();

    totalsCalc(root, groupRule, false);

    expect(root.rows[0].style.display).toBe('none');
    expect(root.rows[1].style.display).toBe('none');
  });

  it('keeps zero-valued rows when zero rows are enabled', () => {
    const root = createReportTable();

    totalsCalc(root, groupRule, true);

    expect(root.rows[0].style.display).toBe('');
    expect(root.rows[1].style.display).toBe('');
  });

  it('enables zero rows for detailed or explicit empty-row views', () => {
    expect(shouldKeepZeroRows(false, false)).toBe(false);
    expect(shouldKeepZeroRows(true, false)).toBe(true);
    expect(shouldKeepZeroRows(false, true)).toBe(true);
  });
});
