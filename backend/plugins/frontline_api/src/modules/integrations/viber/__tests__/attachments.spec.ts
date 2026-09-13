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

interface AttachmentInput {
  buffer: Buffer;
  fileName: string;
  mimetype: string;
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
};
const MAX_BYTES = 25 * 1024 * 1024;
const STORAGE_KEY = 'stored/viber-attachment-test';

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

test('allows empty and maximum-sized files but rejects bytes above the local 25 MiB cap', async (t) => {
  const h = createAttachmentHarness(t);

  for (const size of [0, MAX_BYTES]) {
    const result = await h.store('tenant-test', {
      ...INPUT,
      buffer: Buffer.alloc(size),
    });
    strictEqual(result.size, size);
  }
  const previousEvents = [...h.events];
  await rejects(
    h.store('tenant-test', { ...INPUT, buffer: Buffer.alloc(MAX_BYTES + 1) }),
    /Invalid Viber attachment size/,
  );
  deepStrictEqual(h.events, previousEvents);
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
