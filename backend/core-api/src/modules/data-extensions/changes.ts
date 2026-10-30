import { createHmac, randomBytes } from 'crypto';
import { lookup, LookupAddress } from 'dns';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { isIP } from 'net';
import { Connection, Model, Schema } from 'mongoose';
import {
  DataExtensionValidationError,
  getDataExtensionRecordType,
} from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
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
}

const CHANGES_COLLECTION = 'data_extensions_changes';
const WEBHOOKS_COLLECTION = 'data_extensions_webhooks';
const WEBHOOKS_PER_TENANT = 20;
const WEBHOOK_TIMEOUT_MS = 5000;
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
  },
  { timestamps: true },
);

const modelOf = <T>(
  models: IModels,
  name: string,
  schema: Schema,
): Model<T> => {
  const connection = models.DataExtensionFields.db as Connection;

  return (connection.models[name] as Model<T>) || connection.model<T>(name, schema);
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

const allowHttp = () => process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP === 'true';

/** Loopback, private, link-local, CGNAT, multicast and metadata ranges. */
const isPrivateAddress = (address: string) => {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();

    // IPv4-mapped addresses, dotted (::ffff:127.0.0.1) or hex (::ffff:7f00:1).
    if (lower.startsWith('::ffff:')) {
      const mapped = lower.slice(7);

      if (isIP(mapped) === 4) {
        return isPrivateAddress(mapped);
      }

      const [high, low] = mapped.split(':').map((part) => parseInt(part, 16));

      if (Number.isNaN(high) || Number.isNaN(low)) {
        return true;
      }

      return isPrivateAddress(
        [high >> 8, high & 255, low >> 8, low & 255].join('.'),
      );
    }

    return (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80') ||
      lower.startsWith('ff')
    );
  }

  const [a, b] = address.split('.').map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
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

  if (isIP(url.hostname.replace(/^\[|\]$/g, '')) && isPrivateAddress(url.hostname.replace(/^\[|\]$/g, ''))) {
    fail('Webhooks cannot target private or local addresses');
  }

  return url;
};

/**
 * DNS lookup for webhook connections that refuses private addresses. It
 * runs inside the connection itself, so a host cannot resolve to a public
 * address for a check and a private one for the request.
 */
const publicLookup = (
  hostname: string,
  options: object,
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number,
  ) => void,
) => {
  lookup(hostname, { ...options, all: true, verbatim: true }, (error, addresses) => {
    if (error) {
      return callback(error, '');
    }

    const list = addresses as LookupAddress[];

    if (!list.length || list.some(({ address }) => isPrivateAddress(address))) {
      return callback(
        Object.assign(new Error('Webhook host resolves to a private or local address'), {
          code: 'EPRIVATE',
        }),
        '',
      );
    }

    if ((options as { all?: boolean }).all) {
      return callback(null, list);
    }

    callback(null, list[0].address, list[0].family);
  });
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

const normalizeWebhook = (input: Partial<IDataExtensionWebhook>, existing?: IDataExtensionWebhook) => {
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
    const recordTypes = Array.isArray(input.recordTypes) ? input.recordTypes : [];

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
  (await webhooksOf(models).find().sort({ createdAt: 1 }).lean<IDataExtensionWebhook[]>()).map(
    withoutSecret,
  );

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
  const existing = await webhooksOf(models).findById(_id).lean<IDataExtensionWebhook | null>();

  if (!existing) {
    return fail('Webhook not found');
  }

  const updated = await webhooksOf(models)
    .findOneAndUpdate({ _id }, { $set: normalizeWebhook(input, existing) }, { new: true })
    .lean<IDataExtensionWebhook | null>();

  return updated && withoutSecret(updated);
};

export const deleteDataExtensionWebhook = async (models: IModels, _id: string) => {
  await webhooksOf(models).deleteOne({ _id });

  return _id;
};

export const signWebhookBody = (secret: string, body: string) =>
  `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

/**
 * Posts a change to every matching webhook, without waiting for them and
 * without following redirects (a 3xx is reported as a failure). Each delivery's result is kept on the
 * webhook so admins can see failures.
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
        $or: [{ recordTypes: { $size: 0 } }, { recordTypes: payload.recordType }],
      })
      .lean<IDataExtensionWebhook[]>();

    await Promise.all(
      hooks.map(async (hook) => {
        const body = JSON.stringify({
          ...payload,
          event: `values.${payload.event}`,
          at: new Date().toISOString(),
        });
        let lastStatus: number | undefined;
        let lastError: string | undefined;

        try {
          lastStatus = await postJson(validateWebhookUrl(hook.url), body, {
            'Content-Type': 'application/json',
            'User-Agent': 'erxes-data-extensions/1',
            'X-Erxes-Signature': signWebhookBody(hook.secret, body),
          });

          if (lastStatus < 200 || lastStatus >= 300) {
            lastError = `HTTP ${lastStatus}`;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }

        await webhooksOf(models).updateOne(
          { _id: hook._id },
          { $set: { lastStatus, lastError: lastError || '', lastAt: new Date() } },
        );
      }),
    );
  };

  run().catch((error) => console.warn('Data Extensions webhooks failed', error));
};
