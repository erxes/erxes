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
