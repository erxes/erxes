import {
  PAPER_SIZES,
  PAPER_TYPES,
  PX_PER_MM,
} from 'ui-modules/modules/documents/constants';

export const PAGE_STYLE_ID = 'erxes-page-size';

const CONTINUOUS_PAGE_HEIGHT_SAFETY_MM = 1;

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
    }

    .label-fit {
      display: flow-root;
      width: 100%;
      text-align: left;
      overflow-wrap: break-word;
    }

    .label-fit > :first-child {
      margin-top: 0 !important;
    }

    .label-fit > :last-child {
      margin-bottom: 0 !important;
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

    .scaled-content .label-item {
      width: 100% !important;
      max-width: 100% !important;
      min-height: ${Math.max(0, height - margin * 2)}mm !important;
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
    Math.ceil(content.getBoundingClientRect().height / PX_PER_MM) +
      CONTINUOUS_PAGE_HEIGHT_SAFETY_MM,
  );

  style.textContent = `@page { size: ${width}mm ${paperHeight}mm; margin: 0; }`;

  return paperHeight;
};

export const waitForImages = async (iframe: HTMLIFrameElement) => {
  const doc = iframe.contentDocument;

  if (!doc) {
    return;
  }

  const pending = Array.from(doc.images).filter((image) => !image.complete);

  await Promise.all(
    pending.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );
};

const FIT_MIN_RATIO = 0.1;
const FIT_PASSES = 8;

const fitRatio = (box: HTMLElement, content: HTMLElement) => {
  const availableHeight = box.clientHeight;
  const availableWidth = box.clientWidth;

  if (!availableHeight || !availableWidth) {
    return 1;
  }

  const fitsAt = (ratio: number) => {
    content.style.width = `${availableWidth / ratio}px`;

    return content.scrollHeight * ratio <= availableHeight;
  };

  if (fitsAt(1)) {
    content.style.width = '';

    return 1;
  }

  if (!fitsAt(FIT_MIN_RATIO)) {
    content.style.width = '';

    const naturalHeight = content.scrollHeight;

    return naturalHeight ? Math.min(availableHeight / naturalHeight, 1) : 1;
  }

  let low = FIT_MIN_RATIO;
  let high = 1;

  for (let pass = 0; pass < FIT_PASSES; pass += 1) {
    const middle = (low + high) / 2;

    if (fitsAt(middle)) {
      low = middle;
    } else {
      high = middle;
    }
  }

  fitsAt(low);

  return low;
};

export const transformLabels = (iframe: HTMLIFrameElement, config: any) => {
  const { type } = resolveSize(config);

  if (type !== PAPER_TYPES.ROLL) {
    return;
  }

  const doc = iframe.contentDocument;

  if (!doc) {
    return;
  }

  const userScale = (Number(config.scale) || 100) / 100;
  const offsetX = Number(config.offsetX) || 0;
  const offsetY = Number(config.offsetY) || 0;

  const shift = `translate(${offsetX}mm, ${offsetY}mm)`;

  const fits = Array.from(doc.querySelectorAll<HTMLElement>('.label-fit'));

  if (!fits.length) {
    const container = doc.querySelector<HTMLElement>('.scaled-content');

    if (container) {
      container.style.transformOrigin = 'top left';
      container.style.transform = `${shift} scale(${userScale})`;
    }

    return;
  }

  for (const fit of fits) {
    const box = fit.parentElement;

    fit.style.transform = '';
    fit.style.width = '';

    const ratio = box ? fitRatio(box, fit) : 1;

    fit.style.transformOrigin = 'top left';
    fit.style.transform = `${shift} scale(${ratio * userScale})`;
  }
};

export const buildLabelPages = (iframe: HTMLIFrameElement, config: any) => {
  const { isContinuous } = resolveSize(config);

  const doc = iframe.contentDocument;

  if (!doc) {
    return [];
  }

  const styles = Array.from(doc.querySelectorAll('style'))
    .map((style) => style.textContent || '')
    .join('\n')
    .replace(/@page\s*\{[^}]*\}/g, '');

  const container = doc.querySelector('.scaled-content');

  if (!container) {
    return [];
  }

  const items = Array.from(doc.querySelectorAll('.label-item'));

  const bodies =
    isContinuous || !items.length
      ? [container.innerHTML]
      : items.map((item) => item.outerHTML);

  return bodies.map(
    (body) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${styles}</style>
  </head>
  <body>
    <div class="scaled-content">${body}</div>
  </body>
</html>`,
  );
};

export const layout = (
  document: string,
  config: any,
  iframe: HTMLIFrameElement,
) => {
  iframe.srcdoc = buildLayoutHtml(document, config);
};
