import { EventEmitter } from 'events';

let receiverStatus = 500;

jest.mock('https', () => ({
  request: (
    _url: URL,
    _options: unknown,
    onResponse: (res: unknown) => void,
  ) => {
    const req = new EventEmitter() as EventEmitter & {
      end: () => void;
      destroy: () => void;
    };

    req.end = () =>
      setImmediate(() =>
        onResponse({ statusCode: receiverStatus, resume: () => undefined }),
      );
    req.destroy = () => undefined;

    return req;
  },
}));

process.env.DATA_EXTENSIONS_WEBHOOKS_PAUSE_AFTER = '3';

import { attemptWebhookDelivery, editDataExtensionWebhook } from './changes';

type Doc = Record<string, any>;

/** Just enough of a Mongoose model for the webhook update paths. */
const fakeWebhooks = (doc: Doc) => {
  const matches = (filter: Doc) =>
    Object.entries(filter).every(([key, expected]) =>
      expected && typeof expected === 'object' && '$gte' in expected
        ? (doc[key] || 0) >= expected.$gte
        : doc[key] === expected,
    );
  const apply = (update: Doc) => {
    Object.assign(doc, update.$set || {});

    for (const [key, by] of Object.entries(update.$inc || {})) {
      doc[key] = (doc[key] || 0) + (by as number);
    }

    for (const key of Object.keys(update.$unset || {})) {
      delete doc[key];
    }
  };
  const query = (value: () => unknown) => ({ lean: async () => value() });

  return {
    findById: () => query(() => ({ ...doc })),
    findOneAndUpdate: (filter: Doc, update: Doc) =>
      query(() => {
        if (!matches(filter)) {
          return null;
        }

        apply(update);
        return { ...doc };
      }),
    updateOne: async (filter: Doc, update: Doc) => {
      if (matches(filter)) {
        apply(update);
      }
    },
  };
};

const modelsWith = (doc: Doc) =>
  ({
    DataExtensionFields: {
      db: { models: { data_extensions_webhooks: fakeWebhooks(doc) } },
    },
  } as never);

const delivery = {
  subdomain: 'acme',
  webhookId: 'hook-1',
  deliveryId: 'delivery-1',
  body: '{}',
};

const hook = (): Doc => ({
  _id: 'hook-1',
  name: 'CRM sync',
  url: 'https://hooks.example.com/erxes',
  recordTypes: [],
  secret: 'secret',
  active: true,
  createdBy: 'user-1',
  failedDeliveries: 0,
  consecutiveFailures: 0,
});

const lastTry = { isLastAttempt: true };

describe('automatic pause', () => {
  beforeEach(() => {
    receiverStatus = 500;
  });

  it('pauses a webhook after 3 deliveries in a row failed every try', async () => {
    const doc = hook();
    const models = modelsWith(doc);

    for (let i = 0; i < 2; i += 1) {
      await expect(
        attemptWebhookDelivery(models, delivery, lastTry),
      ).rejects.toThrow('HTTP 500');
    }

    expect(doc.active).toBe(true);

    await expect(
      attemptWebhookDelivery(models, delivery, lastTry),
    ).rejects.toThrow('HTTP 500');

    expect(doc).toMatchObject({
      active: false,
      pausedReason: 'failing',
      consecutiveFailures: 3,
      failedDeliveries: 3,
    });
    expect(doc.pausedAt).toBeInstanceOf(Date);
  });

  it('does not count tries that will be retried', async () => {
    const doc = hook();

    await expect(
      attemptWebhookDelivery(modelsWith(doc), delivery, {
        isLastAttempt: false,
      }),
    ).rejects.toThrow('HTTP 500');

    expect(doc.consecutiveFailures).toBe(0);
    expect(doc.failedDeliveries).toBe(0);
  });

  it('starts the count again after a success', async () => {
    const doc: Doc = { ...hook(), consecutiveFailures: 2 };
    receiverStatus = 200;

    await attemptWebhookDelivery(modelsWith(doc), delivery, lastTry);

    expect(doc.consecutiveFailures).toBe(0);
    expect(doc.lastError).toBe('');
  });

  it('skips deliveries once the webhook is paused', async () => {
    const doc: Doc = { ...hook(), active: false, pausedReason: 'failing' };

    await attemptWebhookDelivery(modelsWith(doc), delivery, lastTry);

    expect(doc.lastAt).toBeUndefined();
  });

  it('clears the automatic pause when someone resumes the webhook', async () => {
    const doc = {
      ...hook(),
      active: false,
      pausedReason: 'failing',
      pausedAt: new Date(),
      consecutiveFailures: 3,
    };

    const resumed = await editDataExtensionWebhook(modelsWith(doc), 'hook-1', {
      active: true,
    });

    expect(resumed).toMatchObject({ active: true, consecutiveFailures: 0 });
    expect(doc.pausedReason).toBeUndefined();
    expect(doc.pausedAt).toBeUndefined();
  });
});
