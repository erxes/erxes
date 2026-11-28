// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { printElement } from './print';

/** The print frame the call added, before it prints. */
const frame = () => {
  const found = document.querySelector('iframe');

  if (!found) throw new Error('No print frame');

  return found;
};

afterEach(() => {
  document.adoptedStyleSheets = [];
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('printElement', () => {
  it("prints only the element, with the page's styles and the sheet's @page", () => {
    document.head.innerHTML =
      '<link rel="stylesheet" href="/remotes/accounting/main.css"><style>.voucher { font-size: 11px }</style>';
    document.body.innerHTML =
      '<nav>Sidebar</nav><div id="voucher" class="voucher">Cash voucher №12</div>';

    // A plugin's own classes, adopted as addPluginStyles does.
    const plugin = new CSSStyleSheet();

    plugin.replaceSync('.border-t-4 { border-top-width: 4px; }');
    document.adoptedStyleSheets = [plugin];

    const voucher = document.querySelector<HTMLElement>('#voucher');

    if (!voucher) throw new Error('No voucher');

    void printElement(voucher);

    const html = frame().srcdoc;

    expect(html).toContain(
      '<link rel="stylesheet" href="http://localhost:3000/remotes/accounting/main.css">',
    );
    expect(html).toContain('<style>.voucher { font-size: 11px }</style>');
    expect(html).toContain('border-top-width: 4px');
    expect(html).toContain('@page { size: A4; margin: 10mm }');
    expect(html).toContain('<div id="voucher" class="voucher">Cash voucher №12</div>');
    expect(html).not.toContain('Sidebar');
    expect(frame().getAttribute('sandbox')).toBe('allow-same-origin allow-modals');
  });

  it('takes another sheet', () => {
    document.body.innerHTML = '<div id="receipt">Receipt</div>';

    const receipt = document.querySelector<HTMLElement>('#receipt');

    if (!receipt) throw new Error('No receipt');

    void printElement(receipt, { page: 'size: 80mm auto; margin: 0' });

    expect(frame().srcdoc).toContain('@page { size: 80mm auto; margin: 0 }');
  });
});
