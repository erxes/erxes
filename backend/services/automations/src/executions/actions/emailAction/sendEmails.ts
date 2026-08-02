import {
  alignSender,
  deliverEmail,
  getEnv,
  loadEmailProviderConfig,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { debugError } from '../../../debugger';
import { createDeliveryLogPort } from '../../../utils/emailDeliveryLog';
import { createSuppressionPort } from '../../../utils/emailSuppression';
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
      replyTo?: string;
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
    replyTo: requestedReplyTo,
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

  const requested = fromEmail || COMPANY_EMAIL_FROM;

  if (!requested) {
    throw new Error(`"From" email address is missing: ${requested}`);
  }

  const alignedFrom = await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'core',
    module: 'emailSenders',
    action: 'alignedFrom',
    input: {},
  });

  const { from, replyTo } = alignSender(
    requested,
    requestedReplyTo,
    alignedFrom,
  );

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
        replyTo,
        to: toEmails,
        cc: ccEmails.length ? ccEmails : undefined,
        subject: title,
        html: customHtml,
      },
      log: createDeliveryLogPort(subdomain),
      suppression: createSuppressionPort(subdomain),
      meta: { source: 'automation', sourceId: executionId, subdomain },
    });

    if (result.skipped) {
      return {
        from,
        toEmails,
        ccEmails: ccEmails.length ? ccEmails : undefined,
        skipped: true,
        suppressed: result.suppressed,
      };
    }

    return {
      from,
      messageId: result.messageId,
      toEmails,
      ccEmails: ccEmails.length ? ccEmails : undefined,
      suppressed: result.suppressed,
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
