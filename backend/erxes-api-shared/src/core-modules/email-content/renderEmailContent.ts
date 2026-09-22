import { blocksToHtml } from './blocksToHtml';
import { expandCustomNodes } from './customNodes';
import { EMAIL_CONTENT_FORMATS } from './constants';
import { appendUnsubscribeFooter } from './emailFooter';
import { renderMailyHtml } from './renderMailyHtml';
import {
  TEmailContent,
  TEmailContentFormat,
  TRenderEmailContentOptions,
} from './types';
import { resolveEmailVariableValues } from './variables';

/**
 * What an email body was written in. Content saved before the format was
 * recorded carries no marker, and block content is what that used to mean —
 * so nothing has to be migrated for this to be right.
 */
export const resolveEmailContentFormat = (
  email?: TEmailContent,
): TEmailContentFormat => {
  if (email?.contentFormat) {
    return email.contentFormat;
  }

  return email?.contentJson
    ? EMAIL_CONTENT_FORMATS.MAILY
    : EMAIL_CONTENT_FORMATS.BLOCKS;
};

/**
 * The one place an email body becomes html, whichever editor wrote it and
 * whichever service is sending it.
 */
export const renderEmailContent = async (
  email: TEmailContent,
  options: TRenderEmailContentOptions = {},
): Promise<string> => {
  const {
    replacer,
    payloads,
    replaceBlocks,
    unsubscribeUrl,
    postalAddress,
    blocksConfig,
  } = options;

  if (resolveEmailContentFormat(email) === EMAIL_CONTENT_FORMATS.MAILY) {
    if (!email.contentJson) {
      return '';
    }

    // Blocks the editor added but the renderer does not know are turned into
    // html it does, so a new block never silently disappears from an email.
    const html = await renderMailyHtml(expandCustomNodes(email.contentJson), {
      variables: resolveEmailVariableValues(email.contentJson, replacer || {}),
      payloads,
      previewText: email.previewText,
    });

    // The editor renders the email itself, so the footer is appended to its
    // html rather than wrapped around it the way block content is.
    return unsubscribeUrl
      ? appendUnsubscribeFooter(html, { unsubscribeUrl, postalAddress })
      : html;
  }

  const content = email.content || '';
  const blocks = replaceBlocks ? await replaceBlocks(content) : content;

  return blocksToHtml(blocks, {
    ...blocksConfig,
    ...(unsubscribeUrl
      ? { wrapper: { email: true, unsubscribeUrl, postalAddress } }
      : {}),
  });
};
