import { PAPER_SIZES } from 'ui-modules/modules/documents/constants';

export const paper = (size: string, orientation: 'portrait' | 'landscape') => {
  const BASE_SIZE = PAPER_SIZES[size as keyof typeof PAPER_SIZES];

  const PAPER_SIZE = {
    portrait: { width: BASE_SIZE.width, height: BASE_SIZE.height },
    landscape: { width: BASE_SIZE.height, height: BASE_SIZE.width },
  }[orientation];

  return PAPER_SIZE;
};

export const layout = (
  document: string,
  config: any,
  iframe: HTMLIFrameElement,
) => {
  const { size, margin, scale, orientation } = config;

  const SCALE_FACTOR = scale / 100;
  const SCALE_TO_FIT = scale < 100;

  const doc = iframe.contentDocument || iframe.contentWindow?.document;

  if (!doc) return;

  doc.documentElement.innerHTML = '';

  const style = doc.createElement('style');

  style.innerHTML = `
    @page {
      size: ${size} ${orientation};
      margin: ${margin}mm;
    }
      
    * {
      box-sizing: border-box;
    }
      
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.4;
      display: ${SCALE_TO_FIT ? 'flex' : 'block'};
      justify-content: ${SCALE_TO_FIT ? 'center' : 'flex-start'};
      background: white;
    }

    .scaled-content {
      display: inline-block;      
      transform: scale(${SCALE_FACTOR});
      transform-origin: ${SCALE_TO_FIT ? 'top center' : 'top left'};
      width: calc(100% / ${SCALE_FACTOR});
      padding: ${margin}mm;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    table {
      max-width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      word-wrap: break-word;
    }

    @media print {
      .scaled-content {
        transform: none !important;
        width: 100% !important;
        zoom: ${SCALE_FACTOR};
        padding: 0 !important;
      }
    }
  `;

  doc.head.appendChild(style);

  const container = doc.createElement('div');

  container.className = 'scaled-content';
  container.innerHTML = document;

  doc.body.appendChild(container);
};
