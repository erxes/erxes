/** @jest-environment jsdom */
import { applyHtmlThemePolicy } from '../htmlTheme';

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

it('normalizes inline paint and protected tokens while preserving report layout', () => {
  document.body.innerHTML =
    '<section style="display:grid;gap:12px;background:#fff!important;--foreground:#111"><p style="color:#222!important;opacity:.2;-webkit-text-fill-color:#000">Revenue</p></section>';
  const section = document.querySelector('section');
  const paragraph = document.querySelector('p');
  if (!section || !paragraph) throw new Error('Missing fixture');
  // JSDOM 20 rejects var() in color setters; browser checks verify the paint.
  const sectionStyle = jest.spyOn(section.style, 'setProperty');
  const paragraphStyle = jest.spyOn(paragraph.style, 'setProperty');
  applyHtmlThemePolicy(document);
  expect(section?.style.display).toBe('grid');
  expect(section?.style.gap).toBe('12px');
  expect(section?.style.getPropertyValue('--foreground')).toBe('');
  expect(sectionStyle).toHaveBeenCalledWith(
    'background-color',
    'var(--muted)',
    'important',
  );
  expect(paragraphStyle).toHaveBeenCalledWith(
    'color',
    'var(--foreground)',
    'important',
  );
  expect(paragraph?.style.opacity).toBe('');
});

it('normalizes stylesheet rules, pseudo-elements, media rules, and borders', () => {
  document.head.innerHTML =
    '<style>:root{--foreground:#111}.card{border:1px solid black;color:black!important;background:linear-gradient(black,white)} .card::before{color:red} @media(min-width:1px){p{color:#222;filter:opacity(.2)}} </style>';
  applyHtmlThemePolicy(document);
  const rules = document.styleSheets[0].cssRules;
  expect(
    (rules[0] as CSSStyleRule).style.getPropertyValue('--foreground'),
  ).toBe('');
  const card = (rules[1] as CSSStyleRule).style;
  expect(card.getPropertyValue('border-color')).toBe('var(--border)');
  expect(card.getPropertyValue('border')).toBe('1px solid black');
  expect(card.getPropertyValue('color')).toBe('var(--foreground)');
  expect(card.getPropertyPriority('color')).toBe('important');
  expect(card.getPropertyValue('background-color')).toBe('var(--muted)');
  expect((rules[2] as CSSStyleRule).style.color).toBe('var(--foreground)');
  const nested = ((rules[3] as CSSMediaRule).cssRules[0] as CSSStyleRule).style;
  expect(nested.color).toBe('var(--foreground)');
  expect(nested.filter).toBe('');
});

it('keeps readable theme roles, neutralizes legacy attributes, and themes chart labels without changing series', () => {
  document.body.innerHTML =
    '<font color="black">Legacy</font><table bgcolor="white"><tr><td style="color:var(--muted-foreground)">Label</td></tr></table><svg><rect fill="#08a" width="30" height="20"/><text fill="#111" style="fill:#111!important">Revenue</text></svg>';
  const table = document.querySelector('table');
  if (!table) throw new Error('Missing fixture');
  const tableStyle = jest.spyOn(table.style, 'setProperty');
  applyHtmlThemePolicy(document);
  expect(document.querySelector('font')?.hasAttribute('color')).toBe(false);
  expect(tableStyle).toHaveBeenCalledWith(
    'background-color',
    'var(--muted)',
    'important',
  );
  expect(document.querySelector('rect')?.getAttribute('fill')).toBe('#08a');
  expect(document.querySelector('text')?.style.fill).toBe('var(--foreground)');
  expect(document.body.style.background).toBe('transparent');
});

it('keeps renderer-owned styles intact while normalizing model styles', () => {
  document.head.innerHTML =
    '<style data-agent-renderer>p{box-shadow:0 0 0 1px red}</style><style>p{box-shadow:0 0 0 1px red;background:#fff}</style>';
  applyHtmlThemePolicy(document);
  const [renderer, model] = Array.from(document.styleSheets).map(
    (sheet) => (sheet.cssRules[0] as CSSStyleRule).style,
  );
  expect(renderer.getPropertyValue('box-shadow')).toBe('0 0 0 1px red');
  expect(model.getPropertyValue('box-shadow')).toBe('');
  expect(model.getPropertyValue('background-color')).toBe('var(--muted)');
});

it('right-aligns numeric report columns after the label column', () => {
  document.body.innerHTML =
    '<table><thead><tr><th>Year</th><th>Owner</th><th>Value</th><th>Share</th></tr></thead><tbody><tr><td>2025</td><td>Bat</td><td>₮3,962,977</td><td>48.4%</td></tr><tr><td>2026</td><td>Saraa</td><td>—</td><td>+12%</td></tr></tbody></table><table><tr><td colspan="2">Merged</td></tr><tr><td>A</td><td>1</td></tr></table>';
  applyHtmlThemePolicy(document);
  const [report, merged] = Array.from(document.querySelectorAll('table'));
  const aligned = (table: HTMLTableElement) =>
    Array.from(table.rows[0].cells).map((cell) =>
      cell.classList.contains('agent-num'),
    );
  expect(aligned(report)).toEqual([false, false, true, true]);
  expect(report.rows[2].cells[2].classList.contains('agent-num')).toBe(true);
  expect(merged.querySelector('.agent-num')).toBeNull();
});
