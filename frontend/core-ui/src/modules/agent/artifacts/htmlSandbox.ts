import DOMPurify from 'dompurify';

const CSP_DIRECTIVES =
  "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; base-uri 'none'; form-action 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'";

/** Scripts and automatic navigation are disabled before any model content. */
export const buildSandboxedSrcDoc = (html: string): string => {
  const content = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ['style'],
    FORBID_TAGS: [
      'script',
      'meta',
      'base',
      'iframe',
      'object',
      'embed',
      'link',
    ],
  });
  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES}"><meta name="viewport" content="width=device-width, initial-scale=1">\n${content}`;
};
