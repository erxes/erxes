/** @jest-environment jsdom */
import { randomUUID } from 'crypto';
import { capturePageElements, resolvePageElement } from '../focus/pageElements';
const rect = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  right: 100,
  bottom: 20,
  width: 100,
  height: 20,
  toJSON: () => ({}),
};
beforeAll(() =>
  Object.defineProperty(crypto, 'randomUUID', { value: randomUUID }),
);
beforeEach(() => {
  history.replaceState({}, '', '/contacts');
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(rect);
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value: () => [rect],
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});
it('collects semantic labels without inputs, private content, hidden content or editable drafts', () => {
  document.body.innerHTML =
    '<h1>Customers</h1><button aria-label="Add customer">+</button><input aria-label="Search" value="secret draft"><input type="password" aria-label="Password" value="secret"><section data-private><p>Private value</p></section><p hidden>Hidden value</p><div contenteditable="true"><p>Unsent draft</p></div><span>Нийт борлуулалт</span>';
  const catalog = capturePageElements();
  expect(catalog.elements.map((item) => item.label)).toEqual([
    'Customers',
    'Add customer',
    'Search',
    'Нийт борлуулалт',
  ]);
  expect(JSON.stringify(catalog)).not.toMatch(
    /secret|Private|Hidden|Unsent|selector|outerHTML/,
  );
});
it('keeps identity exact across route changes, removal, and recycled row text', () => {
  document.body.innerHTML = '<button aria-label="Add customer">+</button>';
  const catalog = capturePageElements();
  const target = catalog.elements[0];
  const button = document.querySelector('button');
  if (!button) throw new Error('Missing button');
  expect(resolvePageElement(catalog.snapshotId, target.id, catalog.path)).toBe(
    button,
  );
  button.setAttribute('aria-label', 'Delete customer');
  expect(
    resolvePageElement(catalog.snapshotId, target.id, catalog.path),
  ).toBeUndefined();
  button.setAttribute('aria-label', 'Add customer');
  history.replaceState({}, '', '/contacts?panel=/chat');
  expect(resolvePageElement(catalog.snapshotId, target.id, catalog.path)).toBe(
    button,
  );
  history.replaceState({}, '', '/contacts?record=other');
  expect(
    resolvePageElement(catalog.snapshotId, target.id, catalog.path),
  ).toBeUndefined();
  history.replaceState({}, '', '/other');
  expect(
    resolvePageElement(catalog.snapshotId, target.id, catalog.path),
  ).toBeUndefined();
  history.replaceState({}, '', '/contacts');
  button.remove();
  expect(
    resolvePageElement(catalog.snapshotId, target.id, catalog.path),
  ).toBeUndefined();
});
it('retains exact references inside accessible report frames', () => {
  document.body.innerHTML = '<iframe title="Sales report"></iframe>';
  const frame = document.querySelector('iframe');
  if (!frame) throw new Error('Missing frame');
  const doc = frame.contentDocument;
  if (!doc) throw new Error('Missing frame document');
  doc.body.innerHTML = '<button aria-label="Export report">Export</button>';
  const button = doc.querySelector('button');
  if (!button) throw new Error('Missing frame button');
  button.getBoundingClientRect = () => rect;
  const catalog = capturePageElements();
  expect(catalog.elements).toContainEqual(
    expect.objectContaining({ label: 'Export report', frame: 'Sales report' }),
  );
  expect(
    resolvePageElement(
      catalog.snapshotId,
      catalog.elements[0].id,
      catalog.path,
    ),
  ).toBe(button);
});
it('caps catalogs and expires old browser references', () => {
  document.body.innerHTML = Array.from(
    { length: 250 },
    (_, i) => `<button aria-label="Choice ${i}">+</button>`,
  ).join('');
  const original = capturePageElements();
  expect(original.elements).toHaveLength(240);
  for (let i = 0; i < 5; i++) capturePageElements();
  expect(
    resolvePageElement(
      original.snapshotId,
      original.elements[0].id,
      original.path,
    ),
  ).toBeUndefined();
});

it('distinguishes repeated controls by row context and rejects recycled rows', () => {
  document.body.innerHTML =
    '<table><tbody><tr><td>Customer A</td><td><button aria-label="Open record">Open</button></td></tr><tr><td>Customer B</td><td><button aria-label="Open record">Open</button></td></tr></tbody></table>';
  const catalog = capturePageElements();
  const controls = catalog.elements.filter((item) => item.role === 'button');
  expect(controls[0].context).toContain('Customer A');
  expect(controls[1].context).toContain('Customer B');
  const cell = document.querySelector('td');
  if (!cell) throw new Error('Missing row context');
  cell.textContent = 'Customer C';
  expect(
    resolvePageElement(catalog.snapshotId, controls[0].id, catalog.path),
  ).toBeUndefined();
});
