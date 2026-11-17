import { render, screen } from '@testing-library/react';
import { ReportHtml } from '../ReportHtml';

test('renders HTML formatting, inline alignment, tables and line breaks', () => {
  const { container } = render(
    <ReportHtml
      value={
        '<p style="text-align:center"><strong>Header</strong><br><em>Note</em></p><table><tbody><tr><td>Signed</td></tr></tbody></table>\nFooter'
      }
    />,
  );
  expect(screen.getByText('Header').tagName).toBe('STRONG');
  expect(screen.getByText('Note').tagName).toBe('EM');
  expect(container.querySelector('p')?.style.textAlign).toBe('center');
  expect(screen.getByRole('cell', { name: 'Signed' })).toBeTruthy();
  expect(container.querySelector('br')).toBeTruthy();
  expect(container.textContent).toContain('\nFooter');
});

test('removes scripts, event handlers, unsafe links and document-wide style blocks', () => {
  const { container } = render(
    <ReportHtml
      value={
        '<style>body{display:none}</style><script>alert(1)</script><img src="/logo.png" onerror="alert(1)"><a href="javascript:alert(1)">Link</a><b>Footer</b>'
      }
    />,
  );
  expect(container.querySelector('script, style, [onerror]')).toBeNull();
  expect(screen.getByText('Link').getAttribute('href')).toBeNull();
  expect(screen.getByText('Footer').tagName).toBe('B');
});

test('replaces run-date placeholders in HTML without adding an automatic date range', () => {
  render(
    <ReportHtml
      value="<b>{begin_date} / {end_date}</b><p>{fromDate} {toDate} {from_date} {to_date} {from-date} {to-date}</p><span>{unknown}</span>"
      fromDate="2026-01-01"
      toDate="2026-12-31"
    />,
  );
  expect(screen.getByText('2026-01-01 / 2026-12-31').tagName).toBe('B');
  expect(
    screen.getByText(
      '2026-01-01 2026-12-31 2026-01-01 2026-12-31 2026-01-01 2026-12-31',
    ),
  ).toBeTruthy();
  expect(screen.getByText('{unknown}')).toBeTruthy();
});
