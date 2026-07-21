import { PAPER_SIZES } from 'ui-modules/modules/documents/constants';

export const paper = (size: string, orientation: 'portrait' | 'landscape') => {
  const BASE_SIZE =
    PAPER_SIZES[size as keyof typeof PAPER_SIZES] || PAPER_SIZES.A4;

  const PAPER_SIZE = {
    portrait: { width: BASE_SIZE.width, height: BASE_SIZE.height },
    landscape: { width: BASE_SIZE.height, height: BASE_SIZE.width },
  }[orientation];

  return PAPER_SIZE;
};

export const buildLayoutHtml = (document: string, config: any) => {
  const { size, margin, scale, orientation } = config;

  const SCALE_FACTOR = scale / 100;
  const SCALE_TO_FIT = scale < 100;

  const preset = paper(size, orientation);
  const width = Number(config.width) || preset.width;
  const height = Number(config.height) || preset.height;

  const pageSize = `${width}mm ${height}mm`;

  const isLabel = width <= 120 && height <= 200;

  const styleContent = isLabel
    ? `
    @page {
      size: ${width}mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: ${width}mm;
      margin: 0;
      padding: 0;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.3;
    }

    .scaled-content {
      width: ${width}mm;
      box-sizing: border-box;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      word-wrap: break-word;
    }

    @media print {
      .scaled-content {
        transform: none !important;
        zoom: 1 !important;
      }
    }
    `
    : `
    @page {
      size: ${pageSize};
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
      display: ${SCALE_TO_FIT ? 'inline-block' : 'block'};
      transform: scale(${SCALE_FACTOR});
      transform-origin: ${SCALE_TO_FIT ? 'top center' : 'top left'};
      width: calc(100% / ${SCALE_FACTOR});
      padding: ${margin}mm;
    }

    img {
      max-width: 100%;
      height: auto;
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

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${styleContent}</style>
  </head>
  <body>
    <div class="scaled-content">${document}</div>
  </body>
</html>`;
};

export const layout = (
  document: string,
  config: any,
  iframe: HTMLIFrameElement,
) => {
  iframe.srcdoc = buildLayoutHtml(document, config);
};
