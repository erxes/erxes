import {
  PAPER_SIZES,
  PAPER_TYPES,
  PX_PER_MM,
} from 'ui-modules/modules/documents/constants';

export const PAGE_STYLE_ID = 'erxes-page-size';

export const paper = (size: string, orientation: 'portrait' | 'landscape') => {
  const BASE_SIZE = PAPER_SIZES[size] || PAPER_SIZES.A4;

  const PAPER_SIZE = {
    portrait: { width: BASE_SIZE.width, height: BASE_SIZE.height },
    landscape: { width: BASE_SIZE.height, height: BASE_SIZE.width },
  }[orientation];

  return PAPER_SIZE;
};

export const resolveSize = (config: any) => {
  const { size, orientation } = config;

  const preset = PAPER_SIZES[size] || PAPER_SIZES.A4;
  const type = preset.type;

  const base = {
    width: Number(config.width) || preset.width,
    height: Number(config.height) || preset.height,
  };

  const isRoll = type === PAPER_TYPES.ROLL;

  const swap =
    !isRoll && orientation === 'landscape' && base.width < base.height;

  const width = swap ? base.height : base.width;
  const height = swap ? base.width : base.height;

  return {
    type,
    width,
    height,
    isContinuous: isRoll && !height,
  };
};

const BASE_STYLES = `
    * {
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
    }`;

const rollStyles = (width: number, margin: number) => `
    @page {
      margin: 0;
    }
${BASE_STYLES}

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
      padding: ${margin}mm;
    }

    .label-item {
      width: 100%;
    }`;

const labelStyles = (width: number, height: number) => `
    @page {
      size: ${width}mm ${height}mm;
      margin: 0;
    }
${BASE_STYLES}

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
    }

    .label-item {
      width: ${width}mm;
      height: ${height}mm;
      overflow: hidden;
      break-after: page;
      page-break-after: always;
    }

    .label-item:last-child {
      break-after: auto;
      page-break-after: auto;
    }`;

const sheetStyles = (
  width: number,
  height: number,
  margin: number,
  scale: number,
) => {
  const SCALE_FACTOR = scale / 100;
  const SCALE_TO_FIT = scale < 100;

  return `
    @page {
      size: ${width}mm ${height}mm;
      margin: ${margin}mm;
    }
${BASE_STYLES}

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

    @media print {
      .scaled-content {
        transform: none !important;
        width: 100% !important;
        zoom: ${SCALE_FACTOR};
        padding: 0 !important;
      }
    }`;
};

export const buildLayoutHtml = (document: string, config: any) => {
  const { margin, scale } = config;

  const { width, height, type, isContinuous } = resolveSize(config);

  const styleContent =
    type === PAPER_TYPES.ROLL
      ? isContinuous
        ? rollStyles(width, margin)
        : labelStyles(width, height)
      : sheetStyles(width, height, margin, scale);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${styleContent}</style>
    <style id="${PAGE_STYLE_ID}"></style>
  </head>
  <body>
    <div class="scaled-content">${document}</div>
  </body>
</html>`;
};

export const syncPageHeight = (iframe: HTMLIFrameElement, config: any) => {
  const { width, height, isContinuous } = resolveSize(config);

  if (!isContinuous) {
    return height;
  }

  const content = iframe.contentDocument?.querySelector('.scaled-content');
  const style = iframe.contentDocument?.getElementById(PAGE_STYLE_ID);

  if (!content || !style) {
    return height;
  }

  const paperHeight = Math.max(
    1,
    Math.ceil(content.getBoundingClientRect().height / PX_PER_MM),
  );

  style.textContent = `@page { size: ${width}mm ${paperHeight}mm; margin: 0; }`;

  return paperHeight;
};

export const layout = (
  document: string,
  config: any,
  iframe: HTMLIFrameElement,
) => {
  iframe.srcdoc = buildLayoutHtml(document, config);
};
