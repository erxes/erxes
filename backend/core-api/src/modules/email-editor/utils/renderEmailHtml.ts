import { Maily } from '@maily-to/render';
import { JSONContent, RenderEmailHtmlOptions } from '../@types';

/**
 * Turns a Maily (Tiptap JSON) email document into email-client-safe HTML.
 * This is the single rendering path shared by campaign preview and send —
 * they must never drift, so every consumer should call this instead of
 * touching `@maily-to/render` directly.
 */
export const renderEmailHtml = async (
  contentJson: JSONContent,
  options: RenderEmailHtmlOptions = {},
): Promise<string> => {
  const { variables = {}, payloads = {} } = options;

  const maily = new Maily(contentJson);

  for (const [name, value] of Object.entries(variables)) {
    maily.setVariableValue(name, value ?? '');
  }

  for (const [key, value] of Object.entries(payloads)) {
    maily.setPayloadValue(key, value);
  }

  return maily.render();
};
