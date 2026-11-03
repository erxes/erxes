import { createHmac, randomBytes, randomUUID } from 'crypto';
import { UnrecoverableError } from 'bullmq';
import { lookup, LookupAddress } from 'dns';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { BlockList, isIP } from 'net';
import { Connection, Model, Schema } from 'mongoose';
import {
  DataExtensionValidationError,
  getDataExtensionRecordType,
} from 'erxes-api-shared/core-modules';
import {
  mongooseStringRandomId,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export interface IDataExtensionChange {
  recordType: string;
  recordId: string;
  key: string;
  before: unknown;
  after: unknown;
  event: 'created' | 'updated';
  userId: string;
  createdAt: Date;
}

export interface IDataExtensionWebhook {
  _id: string;
  name: string;
  url: string;
  /** Record types it fires for; every record type when empty. */
  recordTypes: string[];
  secret: string;
  active: boolean;
  createdBy: string;
  lastStatus?: number;
  lastError?: string;
  lastAt?: Date;
  /** Deliveries that failed every try. */
  failedDeliveries?: number;
  /** Deliveries in a row that failed every try; a success resets it. */
  consecutiveFailures?: number;
  /** Set when the webhook was paused for failing, not by a person. */
  pausedReason?: 'failing';
  pausedAt?: Date;
}

const CHANGES_COLLECTION = 'data_extensions_changes';
const WEBHOOKS_COLLECTION = 'data_extensions_webhooks';
const WEBHOOKS_PER_TENANT = 20;
const WEBHOOK_TIMEOUT_MS = 10000;
/** Stored values larger than this are recorded as a size note instead. */
const CHANGE_VALUE_BYTES = 2000;

const changeSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    recordType: { type: String, required: true },
    recordId: { type: String, required: true },
    key: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    event: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

changeSchema.index({ recordType: 1, recordId: 1, createdAt: -1 });

const webhookSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true },
    url: { type: String, required: true },
    recordTypes: { type: [String], default: [] },
    secret: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    lastStatus: { type: Number },
    lastError: { type: String },
    lastAt: { type: Date },
    failedDeliveries: { type: Number, default: 0 },
    consecutiveFailures: { type: Number, default: 0 },
    pausedReason: { type: String },
    pausedAt: { type: Date },
  },
  { timestamps: true },
);

const modelOf = <T>(
  models: IModels,
  name: string,
  schema: Schema,
): Model<T> => {
  const connection = models.DataExtensionFields.db as Connection;

  return (
    (connection.models[name] as Model<T>) || connection.model<T>(name, schema)
  );
};

const changesOf = (models: IModels) =>
  modelOf<IDataExtensionChange>(models, CHANGES_COLLECTION, changeSchema);

const webhooksOf = (models: IModels) =>
  modelOf<IDataExtensionWebhook>(models, WEBHOOKS_COLLECTION, webhookSchema);

const fail = (message: string): never => {
  throw new DataExtensionValidationError(message);
};

/** Large values (long text, JSON) keep history small without losing the fact. */
const storable = (value: unknown) => {
  const size = Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');

  return size > CHANGE_VALUE_BYTES ? { truncated: true, bytes: size } : value;
};

export const recordDataExtensionChanges = async (
  models: IModels,
  recordType: string,
  recordId: string,
  changes: { key: string; before: unknown; after: unknown }[],
  event: 'created' | 'updated',
  userId: string,
) => {
  if (!changes.length) {
    return;
  }

  await changesOf(models).insertMany(
    changes.map((change) => ({
      recordType,
      recordId,
      key: change.key,
      before: storable(change.before),
      after: storable(change.after),
      event,
      userId,
    })),
  );
};

export const listDataExtensionChanges = (
  models: IModels,
  recordType: string,
  recordId: string,
  limit = 50,
) =>
  changesOf(models)
    .find({ recordType, recordId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 200))
    .lean<(IDataExtensionChange & { _id: string })[]>();

// --- Webhooks ---------------------------------------------------------------

const allowHttp = () =>
  process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP === 'true';

const readList = (name: string) =>
  (process.env[name] || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Extra addresses webhooks may not reach, as IPs or CIDRs in
 * DATA_EXTENSIONS_WEBHOOKS_BLOCKED. Internal services can sit on public
 * addresses (SaaS reaches its Redis, RabbitMQ and Elasticsearch that way),
 * which the private-range check alone would let through.
 */
const blockedAddresses = (() => {
  const list = new BlockList();

  for (const entry of readList('DATA_EXTENSIONS_WEBHOOKS_BLOCKED')) {
    const [address, prefix] = entry.split('/');
    const family = isIP(address) === 6 ? 'ipv6' : 'ipv4';

    if (!isIP(address)) {
      console.warn(`DATA_EXTENSIONS_WEBHOOKS_BLOCKED: "${entry}" is not an IP`);
      continue;
    }

    if (prefix === undefined) {
      list.addAddress(address, family);
    } else {
      list.addSubnet(address, Number(prefix), family);
    }
  }

  return list;
})();

/**
 * Ports webhooks may use. DATA_EXTENSIONS_WEBHOOKS_PORTS lists them; when it
 * is not set, SaaS allows 443 only and other installs allow any port.
 */
const allowedPorts = (() => {
  const configured = readList('DATA_EXTENSIONS_WEBHOOKS_PORTS');

  if (configured.length) {
    return configured.includes('*') ? null : new Set(configured);
  }

  return process.env.VERSION === 'saas' ? new Set(['443']) : null;
})();

/** Names that only mean something inside a network or cluster. */
const INTERNAL_HOST =
  /(^|\.)(localhost|local|internal|localdomain|home\.arpa|intranet|lan|svc|cluster\.local)$/i;

/**
 * The IPv4 address inside an IPv4-mapped IPv6 one, dotted (::ffff:127.0.0.1)
 * or hex (::ffff:7f00:1); null when it can't be read.
 */
const mappedIPv4 = (address: string): string | null => {
  const mapped = address.slice(7);

  if (isIP(mapped) === 4) {
    return mapped;
  }

  const [high, low] = mapped.split(':').map((part) => parseInt(part, 16));

  if (Number.isNaN(high) || Number.isNaN(low)) {
    return null;
  }

  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
};

/** Loopback, private, link-local, CGNAT, multicast and metadata ranges. */
const isPrivateAddress = (address: string): boolean => {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();

    if (lower.startsWith('::ffff:')) {
      const mapped = mappedIPv4(lower);

      return mapped === null || isPrivateAddress(mapped);
    }

    return (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      /^fe[89a-f]/.test(lower) ||
      lower.startsWith('ff') ||
      // NAT64 and 6to4 can wrap a private IPv4 address.
      lower.startsWith('64:ff9b:') ||
      lower.startsWith('2002:')
    );
  }

  const [a, b, c] = address.split('.').map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

/** Whether a webhook may not connect to this resolved address. */
export const isRefusedAddress = (address: string) => {
  const family = isIP(address);

  if (!family) {
    return true;
  }

  if (family === 6 && address.toLowerCase().startsWith('::ffff:')) {
    const mapped = mappedIPv4(address.toLowerCase());

    return mapped === null || isRefusedAddress(mapped);
  }

  return (
    isPrivateAddress(address) ||
    blockedAddresses.check(address, family === 6 ? 'ipv6' : 'ipv4')
  );
};

/** Checks the URL's form; addresses are checked again before each delivery. */
export const validateWebhookUrl = (raw: unknown): URL => {
  if (typeof raw !== 'string' || raw.length > 2048) {
    return fail('Enter the webhook URL');
  }

  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    return fail('The webhook URL is not valid');
  }

  if (url.protocol !== 'https:' && !(allowHttp() && url.protocol === 'http:')) {
    fail('Webhooks must use https');
  }

  if (url.username || url.password) {
    fail('Put credentials in the signing secret, not in the URL');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');

  if (isIP(host) ? isRefusedAddress(host) : INTERNAL_HOST.test(host)) {
    fail('Webhooks cannot target private or local addresses');
  }

  const port = url.port || (url.protocol === 'https:' ? '443' : '80');

  if (allowedPorts && !allowedPorts.has(port)) {
    fail(`Webhooks can use port ${[...allowedPorts].join(', ')} only`);
  }

  return url;
};

/**
 * DNS lookup for webhook connections that refuses private addresses. It
 * runs inside the connection itself, so a host cannot resolve to a public
 * address for a check and a private one for the request.
 */
export const publicLookup = (
  hostname: string,
  options: object,
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number,
  ) => void,
) => {
  lookup(
    hostname,
    { ...options, all: true, verbatim: true },
    (error, addresses) => {
      if (error) {
        return callback(error, '');
      }

      const list = addresses as LookupAddress[];

      if (
        !list.length ||
        list.some(({ address }) => isRefusedAddress(address))
      ) {
        return callback(
          Object.assign(
            new Error('Webhook host resolves to a private or local address'),
            {
              code: 'EPRIVATE',
            },
          ),
          '',
        );
      }

      if ((options as { all?: boolean }).all) {
        return callback(null, list);
      }

      callback(null, list[0].address, list[0].family);
    },
  );
};

/** One POST with a hard timeout, no redirects and the checked lookup. */
const postJson = (url: URL, body: string, headers: Record<string, string>) =>
  new Promise<number>((resolve, reject) => {
    const send = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = send(
      url,
      {
        method: 'POST',
        lookup: publicLookup as never,
        timeout: WEBHOOK_TIMEOUT_MS,
        headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode || 0);
      },
    );

    req.on('timeout', () => req.destroy(new Error('Webhook timed out')));
    req.on('error', reject);
    req.end(body);
  });

const normalizeWebhook = (
  input: Partial<IDataExtensionWebhook>,
  existing?: IDataExtensionWebhook,
) => {
  const update: Partial<IDataExtensionWebhook> = {};

  if (input.name !== undefined || !existing) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!name || name.length > 80) {
      fail('A webhook needs a name of up to 80 characters');
    }

    update.name = name;
  }

  if (input.url !== undefined || !existing) {
    update.url = validateWebhookUrl(input.url).toString();
  }

  if (input.recordTypes !== undefined) {
    const recordTypes = Array.isArray(input.recordTypes)
      ? input.recordTypes
      : [];

    for (const recordType of recordTypes) {
      if (!getDataExtensionRecordType(recordType)) {
        fail(`Unsupported record type "${recordType}"`);
      }
    }

    update.recordTypes = Array.from(new Set(recordTypes));
  }

  if (input.active !== undefined) {
    update.active = Boolean(input.active);
  }

  return update;
};

/** Secrets are shown once, when created; lists only say one exists. */
const withoutSecret = ({ secret, ...webhook }: IDataExtensionWebhook) => ({
  ...webhook,
  hasSecret: Boolean(secret),
});

export const listDataExtensionWebhooks = async (models: IModels) =>
  (
    await webhooksOf(models)
      .find()
      .sort({ createdAt: 1 })
      .lean<IDataExtensionWebhook[]>()
  ).map(withoutSecret);

export const addDataExtensionWebhook = async (
  models: IModels,
  input: Partial<IDataExtensionWebhook>,
  userId: string,
) => {
  if ((await webhooksOf(models).countDocuments()) >= WEBHOOKS_PER_TENANT) {
    fail(`A workspace can have at most ${WEBHOOKS_PER_TENANT} webhooks`);
  }

  const secret = randomBytes(24).toString('hex');
  const created = await webhooksOf(models).create({
    recordTypes: [],
    ...normalizeWebhook(input),
    secret,
    active: true,
    createdBy: userId,
  });

  return { ...withoutSecret(created.toObject()), secret };
};

export const editDataExtensionWebhook = async (
  models: IModels,
  _id: string,
  input: Partial<IDataExtensionWebhook>,
) => {
  const existing = await webhooksOf(models)
    .findById(_id)
    .lean<IDataExtensionWebhook | null>();

  if (!existing) {
    return fail('Webhook not found');
  }

  const update = normalizeWebhook(input, existing);
  // Pausing or resuming by hand clears an automatic pause and its streak.
  const resetsPause = update.active !== undefined;

  const updated = await webhooksOf(models)
    .findOneAndUpdate(
      { _id },
      resetsPause
        ? {
            $set: { ...update, consecutiveFailures: 0 },
            $unset: { pausedReason: 1, pausedAt: 1 },
          }
        : { $set: update },
      { new: true },
    )
    .lean<IDataExtensionWebhook | null>();

  return updated && withoutSecret(updated);
};

export const deleteDataExtensionWebhook = async (
  models: IModels,
  _id: string,
) => {
  await webhooksOf(models).deleteOne({ _id });

  return _id;
};

export const signWebhookBody = (secret: string, body: string) =>
  `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

export interface IWebhookDelivery {
  subdomain: string;
  webhookId: string;
  deliveryId: string;
  body: string;
}

export const WEBHOOK_QUEUE = { service: 'dataextensions', name: 'webhooks' };

/** 6 tries: now, then 30s, 1m, 2m, 4m and 8m later (about 16 minutes). */
export const WEBHOOK_ATTEMPTS = 6;
const WEBHOOK_BACKOFF_MS = 30_000;
/**
 * A webhook is paused after this many deliveries in a row failed every try
 * (DATA_EXTENSIONS_WEBHOOKS_PAUSE_AFTER), so a dead receiver stops taking
 * queue time. Resuming it in the Webhooks sheet starts the count again.
 */
const PAUSE_AFTER = (() => {
  const value = Number(process.env.DATA_EXTENSIONS_WEBHOOKS_PAUSE_AFTER);

  return Number.isInteger(value) && value > 0 ? value : 20;
})();
/** Deliveries that failed every try are kept this long for inspection. */
const FAILED_DELIVERY_SECONDS = 7 * 24 * 3600;

/**
 * Network errors, 5xx and 429 may pass on a later try. Any other answer is
 * the receiver refusing the delivery, which a retry will not change.
 */
export const isRetryableWebhookStatus = (status: number) =>
  status === 429 || status >= 500 || status === 0;

/**
 * Queues a change for every matching webhook. Saving a value never waits on
 * a receiver: the queue delivers in the background and retries failures with
 * backoff. The body and its delivery id are fixed here, so every try sends
 * the same signed bytes and receivers can drop duplicates by id.
 */
export const deliverDataExtensionWebhooks = (
  models: IModels,
  payload: {
    event: 'created' | 'updated';
    subdomain: string;
    recordType: string;
    recordId: string;
    userId: string;
    changes: { key: string; before: unknown; after: unknown }[];
  },
) => {
  const run = async () => {
    const hooks = await webhooksOf(models)
      .find({
        active: true,
        $or: [
          { recordTypes: { $size: 0 } },
          { recordTypes: payload.recordType },
        ],
      })
      .lean<IDataExtensionWebhook[]>();

    if (!hooks.length) {
      return;
    }

    const at = new Date().toISOString();
    const queue = sendWorkerQueue(WEBHOOK_QUEUE.service, WEBHOOK_QUEUE.name);

    await Promise.all(
      hooks.map((hook) => {
        const deliveryId = randomUUID();
        const delivery: IWebhookDelivery = {
          subdomain: payload.subdomain,
          webhookId: hook._id,
          deliveryId,
          body: JSON.stringify({
            ...payload,
            event: `values.${payload.event}`,
            deliveryId,
            at,
          }),
        };

        return queue.add('deliver', delivery, {
          jobId: deliveryId,
          attempts: WEBHOOK_ATTEMPTS,
          backoff: { type: 'exponential', delay: WEBHOOK_BACKOFF_MS },
          removeOnComplete: true,
          removeOnFail: { age: FAILED_DELIVERY_SECONDS },
        });
      }),
    );
  };

  run().catch((error) =>
    console.warn('Data Extensions webhooks not queued', error),
  );
};

/**
 * One try of a queued delivery. The result is kept on the webhook so admins
 * see failures; a failure the receiver may recover from is thrown so the
 * queue tries again, and any other is thrown as final.
 */
export const attemptWebhookDelivery = async (
  models: IModels,
  delivery: IWebhookDelivery,
  { isLastAttempt }: { isLastAttempt: boolean },
) => {
  const hook = await webhooksOf(models)
    .findById(delivery.webhookId)
    .lean<IDataExtensionWebhook | null>();

  // Deleted or paused since the change was queued: nothing to send.
  if (!hook || !hook.active) {
    return;
  }

  let status = 0;
  let error = '';
  // A URL or address the checks refuse fails the same way on every try.
  let refused = false;

  try {
    status = await postJson(validateWebhookUrl(hook.url), delivery.body, {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-data-extensions/1',
      'X-Erxes-Delivery-Id': delivery.deliveryId,
      'X-Erxes-Signature': signWebhookBody(hook.secret, delivery.body),
    });

    if (status < 200 || status >= 300) {
      error = `HTTP ${status}`;
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
    refused =
      caught instanceof DataExtensionValidationError ||
      (caught as NodeJS.ErrnoException)?.code === 'EPRIVATE';
  }

  const retryable =
    error !== '' && !refused && isRetryableWebhookStatus(status);
  const final = error !== '' && (!retryable || isLastAttempt);

  const updated = await webhooksOf(models)
    .findOneAndUpdate(
      { _id: hook._id },
      {
        $set: {
          lastStatus: status || undefined,
          lastError: error,
          lastAt: new Date(),
          ...(error ? {} : { consecutiveFailures: 0 }),
        },
        ...(final
          ? { $inc: { failedDeliveries: 1, consecutiveFailures: 1 } }
          : {}),
      },
      { new: true, projection: { consecutiveFailures: 1 } },
    )
    .lean<Pick<IDataExtensionWebhook, 'consecutiveFailures'> | null>();

  if (final && (updated?.consecutiveFailures || 0) >= PAUSE_AFTER) {
    await webhooksOf(models).updateOne(
      // Not if someone resumed it meanwhile, which reset the count.
      {
        _id: hook._id,
        active: true,
        consecutiveFailures: { $gte: PAUSE_AFTER },
      },
      {
        $set: { active: false, pausedReason: 'failing', pausedAt: new Date() },
      },
    );
  }

  if (!error) {
    return;
  }

  throw retryable ? new Error(error) : new UnrecoverableError(error);
};
