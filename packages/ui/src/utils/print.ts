/**
 * Prints a whole HTML page through the browser's print dialog. Plugins
 * print an eBarimt receipt with it, from core's `ebarimt.printReceipt`. The
 * page loads in a hidden frame that runs no scripts, removed once printing ends.
 */
export const printHtml = (html: string) =>
  new Promise<void>((resolve) => {
    const frame = document.createElement('iframe');

    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
    frame.tabIndex = -1;
    frame.className = 'fixed size-0 border-0';

    const done = () => {
      frame.remove();
      resolve();
    };

    frame.addEventListener(
      'load',
      () => {
        const view = frame.contentWindow;

        if (!view) return done();

        view.addEventListener('afterprint', done, { once: true });
        view.focus();
        view.print();
      },
      { once: true },
    );
    frame.srcdoc = html;
    document.body.append(frame);
  });

const escapeAttribute = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

/**
 * The page's stylesheets as tags for another document: core's links and styles, then the
 * sheets plugins adopted (`addPluginStyles`), written out rule by rule.
 */
const pageStyles = () =>
  [
    ...[
      ...document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        'link[rel~="stylesheet"], style',
      ),
    ].map((node) =>
      node instanceof HTMLLinkElement
        ? `<link rel="stylesheet" href="${escapeAttribute(node.href)}">`
        : `<style>${node.textContent ?? ''}</style>`,
    ),
    ...document.adoptedStyleSheets.map(
      (sheet) => `<style>${[...sheet.cssRules].map((rule) => rule.cssText).join('\n')}</style>`,
    ),
  ].join('');

/**
 * Prints one element of the page, with the page's own styles.
 * As 3.x's print pages did: a plugin draws its voucher with its classes, then prints only that,
 * in the light theme. `page` is the sheet's CSS `@page` rule, `size: A4; margin: 10mm` by default.
 */
export const printElement = (element: HTMLElement, { page = 'size: A4; margin: 10mm' } = {}) =>
  printHtml(
    `<!doctype html><html lang="${escapeAttribute(document.documentElement.lang)}"><head><meta charset="utf-8"><base href="${escapeAttribute(document.baseURI)}">${pageStyles()}<style>@page { ${page} } html, body { margin: 0; background: #fff; }</style></head><body>${element.outerHTML}</body></html>`,
  );
