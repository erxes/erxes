import { Maily } from '@maily-to/render';
import { JSONContent, TRenderMailyOptions } from './types';

const addMissingLinkTargets = (html: string): string =>
  html.replace(/<a\s[^>]*>/gi, (tag) =>
    /\btarget=/i.test(tag)
      ? tag
      : tag.replace(/^<a\s/i, '<a target="_blank" rel="noopener noreferrer" '),
  );

export const renderMailyHtml = async (
  contentJson: JSONContent,
  options: TRenderMailyOptions = {},
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

  // Repeated rows read their values off the payload item rather than the
  // variable map, and the renderer only looks there once it is told to
  // replace variables at all.
  if (Object.keys(payloads).length) {
    maily.setShouldReplaceVariableValues(true);
  }

  const html = await maily.render();

  return addMissingLinkTargets(html);
};
