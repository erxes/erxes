import { IBlockEditor } from 'erxes-ui';

const PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const VARIABLE_TOKEN_PATTERN = /{{\s*[^}]+\s*}}/;

export const EMAIL_LINK_URL_PLACEHOLDER =
  'https://example.com or {{ trigger.link }}';

/** BlockNote prefixes `https://` on any protocol-less URL, which corrupts placeholders. */
export const normalizeLinkUrl = (url: string) => {
  const trimmed = url.trim();

  if (
    !trimmed ||
    VARIABLE_TOKEN_PATTERN.test(trimmed) ||
    PROTOCOL_PATTERN.test(trimmed)
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const insertEmailLink = (
  editor: IBlockEditor,
  href: string,
  text: string,
) => {
  editor.insertInlineContent([
    { type: 'link', href, content: text || href },
    ' ',
  ]);
  editor.focus();
};
