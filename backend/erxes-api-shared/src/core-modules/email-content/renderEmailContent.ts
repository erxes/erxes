import { blocksToHtml } from './blocksToHtml';
import { EMAIL_CONTENT_FORMATS } from './constants';
import { appendUnsubscribeFooter } from './emailFooter';
import { replacePlaceholders } from './replacePlaceholders';
import {
  TEmailContent,
  TEmailContentFormat,
  TRenderEmailContentOptions,
} from './types';

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

const renderBody = async (
  email: TEmailContent,
  {
    replaceBlocks,
    unsubscribeUrl,
    postalAddress,
    blocksConfig,
  }: TRenderEmailContentOptions,
) => {
  const content = email.content || '';

  if (resolveEmailContentFormat(email) === EMAIL_CONTENT_FORMATS.MAILY) {
    // The editor rendered the email itself, so the footer is appended to its
    // html rather than wrapped around it the way block content is.
    return unsubscribeUrl
      ? appendUnsubscribeFooter(content, { unsubscribeUrl, postalAddress })
      : content;
  }

  const blocks = replaceBlocks ? await replaceBlocks(content) : content;

  return blocksToHtml(blocks, {
    ...blocksConfig,
    ...(unsubscribeUrl
      ? { wrapper: { email: true, unsubscribeUrl, postalAddress } }
      : {}),
  });
};

/**
 * The one place an email body becomes the html a recipient gets, whichever
 * editor wrote it and whichever service is sending it.
 */
export const renderEmailContent = async (
  email: TEmailContent,
  options: TRenderEmailContentOptions = {},
): Promise<string> => {
  const { resolvers = [], onFields, markMissing } = options;

  return replacePlaceholders(await renderBody(email, options), resolvers, {
    onFields,
    markMissing,
  });
};
