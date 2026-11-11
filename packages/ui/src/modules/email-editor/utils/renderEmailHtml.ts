import { Maily } from '@maily-to/render';
import type { JSONContent } from '@tiptap/core';
import { expandCustomNodes } from './expandCustomNodes';

const addMissingLinkTargets = (html: string): string =>
  html.replace(/<a\s[^>]*>/gi, (tag) =>
    /\btarget=/i.test(tag)
      ? tag
      : tag.replace(/^<a\s/i, '<a target="_blank" rel="noopener noreferrer" '),
  );

/**
 * A field becomes the `{{ … }}` token the server fills per recipient. An
 * automation's output variable is already a token, so it is left as written.
 */
const toPlaceholder = ({
  variable,
  fallback,
}: {
  variable: string;
  fallback?: string;
}) => {
  if (/^\{\{[\s\S]+\}\}$/.test(variable.trim())) {
    return variable.trim();
  }

  const fallbackText = fallback?.replace(/[{}|]/g, '').trim();

  return fallbackText
    ? `{{ ${variable} | ${fallbackText} }}`
    : `{{ ${variable} }}`;
};

/** The email as html, with every field left as a placeholder for the server. */
export const renderEmailHtml = async (
  contentJson?: JSONContent,
  { previewText }: { previewText?: string } = {},
): Promise<string> => {
  if (!contentJson) {
    return '';
  }

  const maily = new Maily(expandCustomNodes(contentJson));

  if (previewText) {
    maily.setPreviewText(previewText);
  }

  maily.setVariableFormatter(toPlaceholder);

  return addMissingLinkTargets(await maily.render());
};
