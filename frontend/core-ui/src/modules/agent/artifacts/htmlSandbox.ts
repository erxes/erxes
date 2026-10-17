const CSP_DIRECTIVES =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; base-uri 'none'; form-action 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'";

export const MIN_PREVIEW_HEIGHT = 120;
export const MAX_PREVIEW_HEIGHT = 12000;

/** The sender must also match the mounted iframe's contentWindow. */
export const readPreviewHeight = (
  data: unknown,
  channel: string,
): number | null => {
  if (
    !data ||
    typeof data !== 'object' ||
    !('channel' in data) ||
    data.channel !== channel ||
    !('height' in data) ||
    typeof data.height !== 'number' ||
    !Number.isFinite(data.height)
  ) {
    return null;
  }
  return Math.min(
    MAX_PREVIEW_HEIGHT,
    Math.max(MIN_PREVIEW_HEIGHT, Math.ceil(data.height)),
  );
};

/** Policy precedes all model content; the opaque iframe can only report size. */
export const buildSandboxedSrcDoc = (html: string, channel = ''): string => {
  const resizeScript = channel
    ? `<script>
(() => {
  const channel = ${JSON.stringify(channel).replace(/</g, '\\u003c')};
  const start = () => {
    let previous = 0;
    let scheduled = false;
    const measure = () => {
      scheduled = false;
      const body = document.body;
      if (!body) return;
      const style = getComputedStyle(body);
      const height = Math.ceil(Math.max(body.scrollHeight, body.getBoundingClientRect().height) +
        (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0));
      if (height !== previous) {
        previous = height;
        parent.postMessage({ channel, height }, '*');
      }
    };
    const schedule = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(measure); }
    };
    new ResizeObserver(schedule).observe(document.body);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    document.fonts.ready.then(schedule);
    schedule();
  };
  document.addEventListener('DOMContentLoaded', start, { once: true });
})();
</script>`
    : '';

  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES}"><meta name="viewport" content="width=device-width, initial-scale=1">${resizeScript}\n${html}`;
};
