import { tenantFromAddress } from './address';
import { deriveTenantSecret, sign } from './hmac';
import { parseInboundMail } from './parse';
import {
  discardStored,
  readPayload,
  serveAttachment,
  storeAttachments,
  storePayload,
} from './storage';
import { masterFor, routeFor } from './routes';
import {
  DeadLetteredMail,
  DeliveryReceipt,
  Env,
  ForwardableEmailMessage,
  QueuedMail,
} from './types';
import { handleVerify } from './verify';

const MAX_INBOUND_BYTES = 25 * 1024 * 1024;

const TRANSIENT_STATUSES = [401, 403, 408, 425, 429];

const VERIFY_PATH = '/verify';

const DLQ_NAME = 'erxes-mail-dlq';

class DeliveryError extends Error {
  public readonly status: number;
  public readonly permanent: boolean;

  constructor(status: number, detail: string) {
    super(`erxes responded ${status}: ${detail}`);

    this.name = 'DeliveryError';
    this.status = status;
    this.permanent = status < 500 && !TRANSIENT_STATUSES.includes(status);
  }
}

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const deliver = async (env: Env, tenant: string, payload: string) => {
  const route = await routeFor(env, tenant);

  if (!route.endpoint) {
    throw new Error('No erxes endpoint is configured for this worker');
  }

  const secret = await deriveTenantSecret(masterFor(env, route), tenant);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const response = await fetch(route.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-erxes-timestamp': timestamp,
      'x-erxes-signature': await sign(`${timestamp}.${payload}`, secret),
    },
    body: payload,
  });

  if (!response.ok) {
    throw new DeliveryError(
      response.status,
      (await response.text()).slice(0, 512),
    );
  }

  const accepted = (await response
    .json()
    .catch(() => undefined)) as DeliveryReceipt | undefined;

  return { keepStored: Boolean(accepted?.keepStored) };
};

const handleQueued = async (env: Env, message: Message<QueuedMail>) => {
  const { id, tenant, messageId } = message.body;
  const payload = await readPayload(env, tenant, id);

  if (!payload) {
    message.ack();
    return;
  }

  try {
    const { keepStored } = await deliver(env, tenant, payload);

    if (!keepStored) {
      await discardStored(env, tenant, id);
    }

    message.ack();
  } catch (error) {
    if (error instanceof DeliveryError && error.permanent) {
      console.error(`Dead-lettering ${messageId} for ${tenant}: ${error.message}`);

      await env.MAIL_DLQ.send({
        ...message.body,
        status: error.status,
        error: error.message,
      });

      message.ack();

      return;
    }

    console.error(`Retrying ${messageId} for ${tenant}: ${describeError(error)}`);

    message.retry();
  }
};

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    if (message.rawSize > MAX_INBOUND_BYTES) {
      message.setReject('Message exceeds the 25 MiB inbound limit');
      return;
    }

    const tenant = tenantFromAddress(message.to) || env.DEFAULT_TENANT;

    if (!tenant) {
      message.setReject(`No mailbox is routed to ${message.to}`);
      return;
    }

    const parsed = await parseInboundMail(message).catch((error: unknown) => {
      message.setReject(`Unreadable message: ${describeError(error)}`);

      return undefined;
    });

    if (!parsed) {
      return;
    }

    const { payload, attachments } = parsed;
    const id = crypto.randomUUID();

    payload.attachments = await storeAttachments(env, tenant, id, attachments);

    await storePayload(env, tenant, id, payload);

    await env.MAIL_QUEUE.send({
      id,
      tenant,
      to: payload.to,
      messageId: payload.messageId,
    });
  },

  async queue(batch: MessageBatch<DeadLetteredMail>, env: Env) {
    if (batch.queue === DLQ_NAME) {
      for (const message of batch.messages) {
        console.error(`mail dead letter ${JSON.stringify(message.body)}`);

        message.ack();
      }

      return;
    }

    for (const message of batch.messages) {
      await handleQueued(env, message);
    }
  },

  async fetch(request: Request, env: Env) {
    if (new URL(request.url).pathname === VERIFY_PATH) {
      return handleVerify(request, env);
    }

    return serveAttachment(request, env);
  },
};
