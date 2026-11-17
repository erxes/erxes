import i18next from 'i18next';
import {
  getReportRunSchema,
  parseReportRunSettings,
  reportRunPath,
} from '../runReport';

const t = i18next.createInstance().t;
const settings = {
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  amountUnit: 'thousands' as const,
  decimals: 0,
};

test('run settings round trip through a standalone preview URL without losing zero precision', () => {
  const url = new URL(reportRunPath('report/id', settings), 'http://localhost');
  expect(url.pathname).toBe('/accounting/tunable-reports/report%2Fid/print');
  expect(url.searchParams.get('inPreview')).toBe('true');
  expect(parseReportRunSettings(url.searchParams, t)).toEqual({
    success: true,
    data: settings,
  });
});

test.each([
  { fromDate: '2026-02-30' },
  { fromDate: '2027-01-01' },
  { toDate: '' },
  { decimals: 7 },
  { decimals: -1 },
  { amountUnit: 'millions' },
])('rejects invalid report run settings: %p', (invalid) => {
  expect(
    getReportRunSchema(t).safeParse({ ...settings, ...invalid }).success,
  ).toBe(false);
});

test('preview URLs require both dates', () => {
  expect(parseReportRunSettings(new URLSearchParams(), t).success).toBe(false);
});
