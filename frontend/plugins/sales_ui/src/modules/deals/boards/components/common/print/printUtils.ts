import {
  DEFAULT_PAPER_SIZE,
  PRINT_DOCUMENT_LOAD_TIMEOUT,
} from '@/deals/boards/components/common/print/constants';
import {
  getPrintDocumentStyles,
  PRINT_LOADING_STYLES,
} from '@/deals/boards/components/common/print/printStyles';

export const getPageHeight = (width: number) =>
  width * (DEFAULT_PAPER_SIZE.height / DEFAULT_PAPER_SIZE.width);

const buildPrintReadyHtml = (html: string, width: number) => {
  const pageWidth = width > 0 ? width : DEFAULT_PAPER_SIZE.width;
  const pageHeight = getPageHeight(pageWidth);
  const documentNode = new DOMParser().parseFromString(html, 'text/html');

  if (!documentNode.body.querySelector('.label-item')) {
    const page = documentNode.createElement('section');
    page.className = 'label-item';

    while (documentNode.body.firstChild) {
      page.appendChild(documentNode.body.firstChild);
    }

    documentNode.body.appendChild(page);
  }

  const style = documentNode.createElement('style');
  style.textContent = getPrintDocumentStyles(pageWidth, pageHeight);
  documentNode.head.appendChild(style);

  return `<!DOCTYPE html>${documentNode.documentElement.outerHTML}`;
};

export const showPrintLoading = (
  printWindow: Window,
  title: string,
  loadingLabel: string,
) => {
  const loadingDocument = printWindow.document;
  const style = loadingDocument.createElement('style');
  style.textContent = PRINT_LOADING_STYLES;

  const container = loadingDocument.createElement('main');
  container.className = 'print-loading';
  container.setAttribute('aria-live', 'polite');

  const spinner = loadingDocument.createElement('span');
  spinner.className = 'print-loading-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const label = loadingDocument.createElement('span');
  label.textContent = loadingLabel;

  container.append(spinner, label);
  loadingDocument.title = title;
  loadingDocument.head.replaceChildren(style);
  loadingDocument.body.replaceChildren(container);
};

const waitForPrintContent = async (printWindow: Window) => {
  const pendingImages = Array.from(printWindow.document.images).map(
    (image) =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }

        const finish = () => {
          image.removeEventListener('load', finish);
          image.removeEventListener('error', finish);
          resolve();
        };

        image.addEventListener('load', finish);
        image.addEventListener('error', finish);

        if (image.complete) {
          finish();
        }
      }),
  );

  await Promise.all([
    printWindow.document.fonts?.ready ?? Promise.resolve(),
    ...pendingImages,
  ]);

  await new Promise<void>((resolve) => {
    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => resolve());
    });
  });
};

const waitForPrintDocument = (
  printWindow: Window,
  printUrl: string,
  errorMessage: string,
) =>
  new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();

    const checkDocument = () => {
      if (printWindow.closed) {
        reject(new Error(errorMessage));
        return;
      }

      if (
        printWindow.document.URL === printUrl &&
        printWindow.document.readyState === 'complete'
      ) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= PRINT_DOCUMENT_LOAD_TIMEOUT) {
        reject(new Error(errorMessage));
        return;
      }

      window.setTimeout(checkDocument, 50);
    };

    checkDocument();
  });

export const printHtml = async (
  printWindow: Window,
  html: string,
  title: string,
  width: number,
  errorMessage: string,
) => {
  const printReadyHtml = buildPrintReadyHtml(html, width);
  const printUrl = URL.createObjectURL(
    new Blob([printReadyHtml], { type: 'text/html;charset=utf-8' }),
  );

  try {
    printWindow.location.replace(printUrl);
    await waitForPrintDocument(printWindow, printUrl, errorMessage);
    URL.revokeObjectURL(printUrl);
    printWindow.document.title = title;
    await waitForPrintContent(printWindow);

    if (printWindow.closed) {
      return;
    }

    printWindow.addEventListener('afterprint', () => printWindow.close(), {
      once: true,
    });
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    URL.revokeObjectURL(printUrl);
    throw error;
  }
};
