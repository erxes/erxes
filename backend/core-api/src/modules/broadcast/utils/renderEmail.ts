import dayjs from 'dayjs';
import {
  recordPlaceholderResolver,
  renderEmailContent,
  TEmailFieldOutcome,
} from 'erxes-api-shared/core-modules';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import * as _ from 'lodash';
import { IModels } from '~/connectionResolvers';
import { documentResolver } from '~/modules/documents/replacePlaceholders';
import { replaceContent } from '~/modules/documents/utils';
import { unsubscribeUrl } from '~/utils/email/links';
import { readFileUrl } from './email';

const blockValue = (replacer: Record<string, unknown>, path: string) => {
  const value = _.get(replacer, path);

  if (typeof value === 'number') {
    return value.toString();
  }

  if (value instanceof Date) {
    return dayjs(value).format('YYYY-MM-DD');
  }

  return value?.toString() || '-';
};

/**
 * One recipient's email, exactly as it will be sent.
 *
 * Kept out of the worker so a dry run can produce the same body from the same
 * code — a rehearsal that renders through a second path proves nothing about
 * what the campaign will actually send.
 */
export const renderBroadcastEmail = async ({
  models,
  subdomain,
  email,
  customer,
  postalAddress,
  onFields,
}: {
  models: IModels;
  subdomain: string;
  email: Record<string, any>;
  customer: ICustomerDocument;
  postalAddress: string;
  onFields?: (fields: TEmailFieldOutcome[]) => void;
}) => {
  const link = unsubscribeUrl(subdomain, { cid: customer._id });

  const htmlContent = await renderEmailContent(email || {}, {
    // An embedded document is rendered for the person receiving it.
    resolvers: [
      documentResolver({ models, replacerIds: [String(customer._id)] }),
      recordPlaceholderResolver(customer),
    ],
    replaceBlocks: (content) =>
      replaceContent({
        replacer: customer,
        content,
        replacement: blockValue,
      }),
    unsubscribeUrl: link,
    postalAddress,
    blocksConfig: {
      resolveImageUrl: (url: string) => readFileUrl(url, subdomain),
    },
    onFields,
  });

  return { link, htmlContent };
};
