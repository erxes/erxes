import { test } from 'node:test';
import {
  deepStrictEqual,
  notStrictEqual,
  rejects,
  strictEqual,
} from 'node:assert';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadViberHelpers, type TestContext } from './helperHarness';
import type { ViberMediaType } from '../constants';

interface AttachmentInput {
  buffer: Buffer;
  fileName: string;
  mimetype: string;
  messageType: ViberMediaType;
}

interface UploadRequest {
  subdomain: string;
  filePath: string;
  fileName: string;
  mimetype: string;
  forcePrivate: boolean;
}

const INPUT: AttachmentInput = {
  buffer: Buffer.from('test attachment bytes'),
  fileName: 'diagram.png',
  mimetype: 'image/png',
  messageType: 'picture',
};
const MEDIA_LIMITS = [
  { messageType: 'picture', maxBytes: 3 * 1024 * 1024 },
  { messageType: 'video', maxBytes: 26 * 1024 * 1024 },
  { messageType: 'file', maxBytes: 50 * 1024 * 1024 },
] as const;
const STORAGE_KEY = 'stored/viber-attachment-test';
// Reserved test host, not a configured production Viber hostname.
const DOWNLOAD_INPUT = {
  source: 'https://media.example.test/attachment?signature=test',
  fileName: INPUT.fileName,
  messageType: INPUT.messageType,
  allowedHostnames: ['media.example.test'],
};

const createAttachmentHarness = (t: TestContext) => {
  const events: string[] = [];
  const uploads: UploadRequest[] = [];
  const writes: { filePath: string; bytes: Uint8Array; mode: number }[] = [];
  const removed: string[] = [];
  let directoryCount = 0;

  const upload = t.mock.fn(async (request: UploadRequest) => {
    events.push('upload');
    uploads.push(request);
    return STORAGE_KEY;
  });

  // Load modules first so compiler-cache writes are not counted as attachment I/O.
  const helpers = loadViberHelpers(t, {
    sharedUtils: { uploadFileToStorage: upload },
    connectionResolvers: {
      generateModels: () => {
        throw new Error('Attachment storage must not access message models');
      },
    },
    inboxReceiver: {},
  });

  // Attachment filesystem operations and storage requests remain mocked.
  const mkdtemp = t.mock.method(
    fsPromises,
    'mkdtemp',
    async (prefix: string) => {
      events.push('mkdir');
      strictEqual(prefix, join(tmpdir(), 'viber-'));
      directoryCount += 1;
      return `${prefix}unit-${directoryCount}`;
    },
  );
  const writeFile = t.mock.method(
    fsPromises,
    'writeFile',
    async (filePath: string, bytes: Uint8Array, options: { mode: number }) => {
      events.push('write');
      writes.push({ filePath, bytes, mode: options.mode });
    },
  );
  const remove = t.mock.method(
    fsPromises,
    'rm',
    async (
      directory: string,
      options: { recursive: boolean; force: boolean },
    ) => {
      events.push('remove');
      deepStrictEqual(options, { recursive: true, force: true });
      removed.push(directory);
    },
  );
  return {
    store: (subdomain = 'tenant-test', input = INPUT) =>
      helpers.storeViberAttachment(subdomain, input),
    downloadAndStore: (subdomain = 'tenant-test', input = DOWNLOAD_INPUT) =>
      helpers.downloadAndStoreViberAttachment(subdomain, input),
    events,
    uploads,
    writes,
    removed,
    mkdtemp,
    writeFile,
    remove,
    upload,
  };
};

test('stores exact bytes through tenant-configured storage and returns native metadata after cleanup', async (t) => {
  const h = createAttachmentHarness(t);

  deepStrictEqual(await h.store(), {
    name: INPUT.fileName,
    url: STORAGE_KEY,
    size: INPUT.buffer.byteLength,
    type: INPUT.mimetype,
  });
  deepStrictEqual(h.events, ['mkdir', 'write', 'upload', 'remove']);
  const directory = join(tmpdir(), 'viber-unit-1');
  deepStrictEqual(h.writes, [
    {
      filePath: join(directory, 'attachment'),
      bytes: new Uint8Array(INPUT.buffer),
      mode: 0o600,
    },
  ]);
  deepStrictEqual(h.uploads, [
    {
      subdomain: 'tenant-test',
      filePath: join(directory, 'attachment'),
      fileName: INPUT.fileName,
      mimetype: INPUT.mimetype,
      forcePrivate: true,
    },
  ]);
  deepStrictEqual(h.removed, [directory]);
});

test('strips path components from names and isolates temporary files for repeated uploads', async (t) => {
  const h = createAttachmentHarness(t);

  for (const fileName of ['../../зураг.png', '..\\folder\\зураг.png']) {
    const result = await h.store('tenant-two', { ...INPUT, fileName });
    strictEqual(result.name, 'зураг.png');
  }

  notStrictEqual(h.uploads[0].filePath, h.uploads[1].filePath);
  deepStrictEqual(
    h.uploads.map(({ subdomain, fileName }) => ({ subdomain, fileName })),
    [
      { subdomain: 'tenant-two', fileName: 'зураг.png' },
      { subdomain: 'tenant-two', fileName: 'зураг.png' },
    ],
  );
  strictEqual(h.removed.length, 2);
});

test('rejects blank tenants, unsafe names, and blank MIME types before filesystem or storage work', async (t) => {
  const h = createAttachmentHarness(t);

  await rejects(h.store(' \t'), /Subdomain is required/);
  for (const fileName of [
    '',
    '  ',
    '.',
    '..',
    '../..',
    'bad\u0000.png',
    'bad\n.png',
  ]) {
    await rejects(
      h.store('tenant-test', { ...INPUT, fileName }),
      /Invalid Viber attachment name/,
    );
  }
  await rejects(
    h.store('tenant-test', { ...INPUT, mimetype: ' \t' }),
    /Invalid Viber attachment type/,
  );
  deepStrictEqual(h.events, []);
});

for (const { messageType, maxBytes } of MEDIA_LIMITS) {
  test(`${messageType}: stores empty and boundary-sized bytes but rejects one byte over its limit before I/O`, async (t) => {
    const h = createAttachmentHarness(t);

    // Keep the same image filename/MIME for every case: the Viber message type
    // selects the size policy, not the extension or reported content type.
    for (const size of [0, maxBytes - 1, maxBytes]) {
      const result = await h.store('tenant-test', {
        ...INPUT,
        messageType,
        buffer: Buffer.alloc(size),
      });
      strictEqual(result.size, size);
    }
    const previousEvents = [...h.events];
    await rejects(
      h.store('tenant-test', {
        ...INPUT,
        messageType,
        buffer: Buffer.alloc(maxBytes + 1),
      }),
      /Invalid Viber attachment size/,
    );
    deepStrictEqual(h.events, previousEvents);
  });
}

test('rejects missing or unsupported media types before filesystem or storage work', async (t) => {
  const h = createAttachmentHarness(t);

  for (const messageType of [
    undefined,
    'url',
    'audio',
    'toString',
    'constructor',
  ]) {
    const input = { ...INPUT, messageType };
    // @ts-expect-error Exercise an invalid caller without weakening the production input type.
    const result = h.store('tenant-test', input);
    await rejects(result, /Unsupported Viber media type/);
  }
  deepStrictEqual(h.events, []);
});

test('a temporary-directory failure does not upload or attempt to remove an uncreated directory', async (t) => {
  const h = createAttachmentHarness(t);
  const error = new Error('Temporary directory unavailable');
  h.mkdtemp.mock.mockImplementation(async () => {
    throw error;
  });

  await rejects(h.store(), (caught: unknown) => caught === error);
  strictEqual(h.writeFile.mock.callCount(), 0);
  strictEqual(h.upload.mock.callCount(), 0);
  strictEqual(h.remove.mock.callCount(), 0);
});

test('a file-write failure skips uploading and still attempts temporary cleanup', async (t) => {
  const h = createAttachmentHarness(t);
  const error = new Error('Disk write failed');
  h.writeFile.mock.mockImplementation(async () => {
    throw error;
  });

  await rejects(h.store(), (caught: unknown) => caught === error);
  strictEqual(h.upload.mock.callCount(), 0);
  deepStrictEqual(h.removed, [join(tmpdir(), 'viber-unit-1')]);
});

test('storage failures reject instead of returning a provider URL and still clean up', async (t) => {
  const h = createAttachmentHarness(t);
  const error = new Error('Storage unavailable');
  h.upload.mock.mockImplementation(async () => {
    throw error;
  });

  await rejects(h.store(), (caught: unknown) => caught === error);
  deepStrictEqual(h.removed, [join(tmpdir(), 'viber-unit-1')]);
});

test('an empty storage location is a failure rather than a successful attachment', async (t) => {
  const h = createAttachmentHarness(t);
  h.upload.mock.mockImplementation(async () => '   ');

  await rejects(
    h.store(),
    /Viber attachment storage returned an empty location/,
  );
  strictEqual(h.remove.mock.callCount(), 1);
});

test('cleanup failures reject instead of reporting that all local work completed', async (t) => {
  const h = createAttachmentHarness(t);
  const error = new Error('Temporary cleanup failed');
  h.remove.mock.mockImplementation(async () => {
    throw error;
  });

  await rejects(h.store(), (caught: unknown) => caught === error);
  strictEqual(h.upload.mock.callCount(), 1);
});

test('downloads then stores exact bytes and reported MIME metadata on the supplied tenant', async (t) => {
  const h = createAttachmentHarness(t);
  const response = new Response(new Uint8Array(INPUT.buffer), {
    headers: { 'content-type': 'IMAGE/PNG; charset=binary' },
  });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    h.events.push('download');
    return response;
  });

  deepStrictEqual(
    await h.downloadAndStore('tenant-two', {
      ...DOWNLOAD_INPUT,
      fileName: '../folder/diagram.png',
    }),
    {
      name: 'diagram.png',
      url: STORAGE_KEY,
      size: INPUT.buffer.byteLength,
      type: 'image/png',
    },
  );
  strictEqual(fetchMock.mock.callCount(), 1);
  strictEqual(
    String(fetchMock.mock.calls[0].arguments[0]),
    DOWNLOAD_INPUT.source,
  );
  deepStrictEqual(h.events, ['download', 'mkdir', 'write', 'upload', 'remove']);
  deepStrictEqual(h.writes[0].bytes, new Uint8Array(INPUT.buffer));
  deepStrictEqual(h.uploads[0], {
    subdomain: 'tenant-two',
    filePath: join(tmpdir(), 'viber-unit-1', 'attachment'),
    fileName: 'diagram.png',
    mimetype: 'image/png',
    forcePrivate: true,
  });
  deepStrictEqual(h.removed, [join(tmpdir(), 'viber-unit-1')]);
  strictEqual(response.body?.locked, false);
});

test('a blank tenant or an empty approved-host list prevents both downloading and storage', async (t) => {
  const h = createAttachmentHarness(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected attachment download');
  });

  await rejects(h.downloadAndStore(' \t'), /Subdomain is required/);
  await rejects(
    h.downloadAndStore('tenant-test', {
      ...DOWNLOAD_INPUT,
      allowedHostnames: [],
    }),
    /Unapproved Viber media host/,
  );
  strictEqual(fetchMock.mock.callCount(), 0);
  deepStrictEqual(h.events, []);
});

test('a failed download does not create temporary files or upload anything', async (t) => {
  const h = createAttachmentHarness(t);
  const failure = new Error('Download unavailable');
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw failure;
  });

  await rejects(h.downloadAndStore(), (caught: unknown) => caught === failure);
  strictEqual(fetchMock.mock.callCount(), 1);
  deepStrictEqual(h.events, []);
});

test('an oversized picture fails while downloading before storage starts', async (t) => {
  const h = createAttachmentHarness(t);
  const response = new Response(new Uint8Array(3 * 1024 * 1024 + 1));
  t.mock.method(globalThis, 'fetch', async () => response);

  await rejects(h.downloadAndStore(), /Viber picture exceeds the 3 MiB limit/);
  deepStrictEqual(h.events, []);
  strictEqual(response.body?.locked, false);
});

test('a file keeps its larger size policy through both downloading and storage', async (t) => {
  const h = createAttachmentHarness(t);
  const size = 4 * 1024 * 1024;
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(new Uint8Array(size), {
        headers: { 'content-type': 'image/png' },
      }),
  );

  const attachment = await h.downloadAndStore('tenant-test', {
    ...DOWNLOAD_INPUT,
    messageType: 'file',
  });
  strictEqual(attachment.size, size);
  strictEqual(h.writes[0].bytes.byteLength, size);
  strictEqual(h.upload.mock.callCount(), 1);
  strictEqual(h.remove.mock.callCount(), 1);
});

test('a storage failure after downloading propagates and cleans up without returning the source URL', async (t) => {
  const h = createAttachmentHarness(t);
  const failure = new Error('Storage unavailable');
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(new Uint8Array(INPUT.buffer)),
  );
  h.upload.mock.mockImplementation(async () => {
    throw failure;
  });

  await rejects(h.downloadAndStore(), (caught: unknown) => caught === failure);
  strictEqual(h.writeFile.mock.callCount(), 1);
  strictEqual(h.upload.mock.callCount(), 1);
  deepStrictEqual(h.removed, [join(tmpdir(), 'viber-unit-1')]);
});
