import { Maily } from '@maily-to/render';
import { JSONContent, RenderEmailHtmlOptions } from '../@types';

const addMissingLinkTargets = (html: string): string =>
  html.replace(/<a\s[^>]*>/gi, (tag) =>
    /\btarget=/i.test(tag)
      ? tag
      : tag.replace(/^<a\s/i, '<a target="_blank" rel="noopener noreferrer" '),
  );

export const renderEmailHtml = async (
  contentJson: JSONContent,
  options: RenderEmailHtmlOptions = {},
): Promise<string> => {
  const { variables = {}, payloads = {}, previewText } = options;

  const maily = new Maily(contentJson);

  if (previewText) {
    maily.setPreviewText(previewText);
  }

  for (const [name, value] of Object.entries(variables)) {
    maily.setVariableValue(name, value ?? '');
  }

  for (const [key, value] of Object.entries(payloads)) {
    maily.setPayloadValue(key, value);
  }

  const html = await maily.render();

  return addMissingLinkTargets(html);
};
