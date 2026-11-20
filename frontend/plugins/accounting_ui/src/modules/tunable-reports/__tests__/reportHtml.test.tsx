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

test('fills the company placeholders of a tax form from the organization and blanks the ones it has no data for', () => {
  const { container } = render(
    <ReportHtml
      value="<p>Татвар төлөгчийн нэр: <b>{name}</b></p><p>Утас: {phone1}, {phone2}</p><p>И-мэйл: {email}</p><p>Гэрчилгээ №{certificate_number}</p>"
      organization={{
        name: 'Алтай Тайга Тур ХХК',
        phoneNumber: '+976 9911 2233',
        email: 'sanhuu@altaitaiga.mn',
      }}
    />,
  );
  expect(screen.getByText('Алтай Тайга Тур ХХК').tagName).toBe('B');
  expect(screen.getByText('Утас: +976 9911 2233,')).toBeTruthy();
  expect(screen.getByText('И-мэйл: sanhuu@altaitaiga.mn')).toBeTruthy();
  expect(screen.getByText('Гэрчилгээ №')).toBeTruthy();
  expect(container.textContent).not.toContain('{');
});

test('a company name with markup characters is printed as text, never as HTML', () => {
  const { container } = render(
    <ReportHtml
      value="<p>{name}</p>"
      organization={{ name: 'А & Б <img src=x onerror=alert(1)> ХХК' }}
    />,
  );
  expect(container.querySelector('img')).toBeNull();
  expect(
    screen.getByText('А & Б <img src=x onerror=alert(1)> ХХК'),
  ).toBeTruthy();
});

test('company placeholders stay visible until the organization is known and unknown tokens are never touched', () => {
  const { rerender } = render(
    <ReportHtml value="<p>{name} · {phone1} · {tin}</p>" />,
  );
  expect(screen.getByText('{name} · {phone1} · {tin}')).toBeTruthy();
  rerender(
    <ReportHtml
      value="<p>{name} · {phone1} · {tin}</p>"
      organization={{ name: 'Номин ХХК' }}
    />,
  );
  expect(screen.getByText('Номин ХХК · · {tin}')).toBeTruthy();
});

test('an apostrophe in the company name cannot break out of a quoted attribute', () => {
  const name = "D'Artagnan' href='https://evil.example";
  const { container } = render(
    <ReportHtml
      value="<p><a title='{name}'>Татвар төлөгч</a> {name}</p>"
      organization={{ name }}
    />,
  );
  const link = container.querySelector('a');
  expect(link?.getAttribute('title')).toBe(name);
  expect(link?.hasAttribute('href')).toBe(false);
  expect(container.textContent).toBe(`Татвар төлөгч ${name}`);
});
