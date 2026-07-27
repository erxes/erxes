import {
  deliverEmail,
  getEnv,
  loadEmailProviderConfig,
} from 'erxes-api-shared/utils';
import { debugError } from '../../../debugger';
import { createDeliveryLogPort } from '../../../utils/emailDeliveryLog';
import { getConfig } from '../../../utils/utils';

export const sendEmails = async (
  subdomain: string,
  {
    payload,
    executionId,
  }: {
    payload: {
      title: string;
      fromEmail: string;
      toEmails: string[];
      ccEmails: string[];
      customHtml: string;
    };
    executionId?: string;
  },
) => {
  const {
    toEmails = [],
    ccEmails = [],
    fromEmail,
    title,
    customHtml,
  } = payload;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  const COMPANY_EMAIL_FROM = await getConfig(subdomain, 'COMPANY_EMAIL_FROM');

  if (!fromEmail && !COMPANY_EMAIL_FROM) {
    throw new Error('From Email is required');
  }

  if (NODE_ENV === 'test') {
    throw new Error('Node environment is required');
  }

  const from = fromEmail || COMPANY_EMAIL_FROM;

  if (!from) {
    throw new Error(`"From" email address is missing: ${from}`);
  }

  let config;

  try {
    config = await loadEmailProviderConfig((code, defaultValue) =>
      getConfig(subdomain, code, defaultValue),
    );
  } catch (e) {
    debugError(e.message);
    throw new Error(e.message);
  }

  try {
    const result = await deliverEmail({
      cacheKey: subdomain,
      config,
      message: {
        from,
        to: toEmails,
        cc: ccEmails.length ? ccEmails : undefined,
        subject: title,
        html: customHtml,
      },
      log: createDeliveryLogPort(subdomain),
      meta: { source: 'automation', sourceId: executionId },
    });

    return {
      from,
      messageId: result.messageId,
      toEmails,
      ccEmails: ccEmails.length ? ccEmails : undefined,
    };
  } catch (error) {
    debugError(error);

    return {
      from,
      toEmails,
      ccEmails: ccEmails.length ? ccEmails : undefined,
      error,
    };
  }
};
