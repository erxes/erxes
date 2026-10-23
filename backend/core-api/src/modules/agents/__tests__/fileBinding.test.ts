import { AGENTS_PAGE_SELECTIONS_DATA_TYPE, collectAgentsPageSelections, migrateLegacyPageSelections } from '@/agents/pageSelections';
import type { UIMessage } from 'ai' with { 'resolution-mode': 'import' };
import { Readable } from 'stream';
import { readFileStreamFromStorage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(),
  readFileFromStorage: jest.fn(async () => { throw new Error('Storage unavailable'); }),
  sanitizeKey: (key: string) => {
    if (!key) throw new Error('Key cannot be empty');
    if (/^https?:\/\//i.test(key)) {
      throw new Error('Invalid key: protocol scheme not allowed');
    }
    if (key.includes('..')) {
      throw new Error('Invalid key: path traversal is not allowed');
    }
    return key;
  },
}));

import {
  AGENTS_FILE_TEXT_MAX_BYTES,
  assertNoClientMediaParts,
  collectAgentsAttachments,
  prepareAgentsFileMessage,
  readAgentsFileText,
} from '@/agents/fileBinding';

const csv = 'name,price,sku\r\n"Монгол, tea",12,TEA-1\r\n';
const attachment = {
  name: 'products.csv',
  url: 'private-products.csv',
  type: 'text/csv',
  size: Buffer.byteLength(csv),
};

const readStream = jest.mocked(readFileStreamFromStorage);
beforeEach(() => readStream.mockReset());

it('rejects native file and image parts on parts or content', () => {
  expect(() =>
    assertNoClientMediaParts({
      parts: [{ type: 'file', mediaType: 'text/plain', url: 'http://127.0.0.1/x' }],
    }),
  ).toThrow('Direct file parts are not allowed');
  expect(() =>
    assertNoClientMediaParts({
      content: [{ type: 'file', data: 'http://127.0.0.1/x', mediaType: 'text/csv' }],
    }),
  ).toThrow('Direct file parts are not allowed');
  expect(() =>
    assertNoClientMediaParts({ parts: [{ type: 'text', text: 'ok' }] }),
  ).not.toThrow();
});

it('collects platform upload metadata and rejects forged ids', () => {
  expect(
    collectAgentsAttachments([
      { type: 'text', text: 'see this' },
      { type: 'data-agents-files', data: { files: [attachment] } },
    ]),
  ).toEqual([attachment]);
  expect(() =>
    collectAgentsAttachments([
      { type: 'data-agents-files', data: { files: [{ id: '64b0c0c0c0c0c0c0c0c0c0c0' }] } },
    ]),
  ).toThrow('Invalid attachment');
});

it('does not fetch HTTP upload URLs', async () => {
  expect(
    await readAgentsFileText('tenant-a', {
      ...attachment,
      url: 'https://imagedelivery.net/abc/shot.png',
      type: 'image/png',
    }),
  ).toBeUndefined();
  expect(readStream).not.toHaveBeenCalled();
});

it('passes complete CSV through real Mastra model conversion', async () => {
  readStream.mockImplementation(async () => Readable.from([Buffer.from(csv)]));
  const text = await readAgentsFileText('tenant-a', attachment);
  const message = await prepareAgentsFileMessage(
    'tenant-a',
    { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Add these products' }] },
    [{ ...attachment, size: Buffer.byteLength(csv) }],
  );
  expect(text).toBe(csv);
  const { convertMessages } = await import('@mastra/core/agent/message-list');
  const stored = convertMessages([message]).to('Mastra.V2');
  expect(stored[0].content.parts).toContainEqual(
    expect.objectContaining({
      type: 'data-agents-files',
      data: expect.objectContaining({
        displayText: 'Add these products',
        textFileUrls: [attachment.url],
      }),
    }),
  );
  const model = convertMessages(stored).to('AIV5.Model');
  expect(JSON.stringify(model)).toContain('TEA-1');
  expect(JSON.stringify(model)).toContain('untrusted');
  expect(JSON.stringify(model)).not.toContain(attachment.url);
});

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
  'base64',
);
const imageAttachment = {
  name: 'shot.png', url: 'shot.png', type: 'image/png', size: png.length,
};

it('passes image pixels through real Mastra conversion and history without a tool call', async () => {
  readStream.mockResolvedValue(Readable.from([png]));
  const message = await prepareAgentsFileMessage('tenant-a', {
    id: 'u-image', role: 'user', parts: [{ type: 'text', text: 'What do you see?' }],
  }, [imageAttachment]);
  expect(readStream).toHaveBeenCalledWith({ subdomain: 'tenant-a', key: 'shot.png' });
  expect(message.parts).toContainEqual({
    type: 'file', mediaType: 'image/png', url: `data:image/png;base64,${png.toString('base64')}`,
  });
  const { convertMessages } = await import('@mastra/core/agent/message-list');
  const stored = convertMessages([message]).to('Mastra.V2');
  const model = convertMessages(stored).to('AIV5.Model');
  expect(JSON.stringify(model)).toContain(png.toString('base64'));
  expect(model).toEqual([{
    role: 'user',
    content: [
      { type: 'text', text: 'What do you see?' },
      { type: 'file', mediaType: 'image/png', data: `data:image/png;base64,${png.toString('base64')}` },
    ],
  }]);
  expect(JSON.stringify(model)).toContain('What do you see?');
  expect(stored[0].content.parts).toContainEqual(expect.objectContaining({
    type: 'data-agents-files',
    data: expect.objectContaining({ files: [imageAttachment], displayText: 'What do you see?' }),
  }));
});

it('rejects forged image metadata rather than silently sending only a filename', async () => {
  readStream.mockResolvedValue(Readable.from([Buffer.from('not image pixels')]));
  await expect(prepareAgentsFileMessage('tenant-a', {
    id: 'u-image', role: 'user', parts: [],
  }, [imageAttachment])).rejects.toThrow('Attachment is not a supported image');
});

it('reports image storage failures without leaking storage details', async () => {
  readStream.mockRejectedValue(new Error('secret storage credentials'));
  await expect(prepareAgentsFileMessage('tenant-a', {
    id: 'u-image', role: 'user', parts: [],
  }, [imageAttachment])).rejects.toThrow('Could not read image attachment');
});

it('rejects oversized images before opening storage', async () => {
  await expect(prepareAgentsFileMessage('tenant-a', {
    id: 'u-image', role: 'user', parts: [],
  }, [{ ...imageAttachment, size: 3 * 1024 * 1024 }])).rejects.toThrow('Images must be at most 2 MiB');
  expect(readStream).not.toHaveBeenCalled();
});

it('rejects oversized registry text before reading', async () => {
  await expect(
    readAgentsFileText('tenant-a', {
      ...attachment,
      size: AGENTS_FILE_TEXT_MAX_BYTES + 1,
    }),
  ).rejects.toThrow('64 KiB');
  expect(readStream).not.toHaveBeenCalled();
});

it('does not leak storage errors', async () => {
  readStream.mockRejectedValue(new Error('private credentials / secret/key'));
  await expect(readAgentsFileText('tenant-a', attachment)).rejects.toThrow(
    'Could not read attachment contents.',
  );
});

it('keeps a content-only text message without spreading extra fields', async () => {
  const prepared = await prepareAgentsFileMessage(
    'tenant-a',
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'text', text: 'hello' }],
      experimental_attachments: [],
    } as unknown as UIMessage,
    [],
  );
  expect(prepared).toEqual({
    id: 'u1',
    role: 'user',
    content: [{ type: 'text', text: 'hello' }],
  });
});

const selection = {
  id: '47b58525-fceb-48ee-9262-dcd040c63bb2', title: 'Төгсжаргалант мандал ХХК',
  path: '/contacts/companies', text: 'Company information', width: 240, height: 80,
  snapshot: { url: 'selection.png', type: 'image/png' as const, size: 68 },
};

it('persists typed page context and feeds pixels/text to the model without a downloadable TXT', async () => {
  const context = { ...selection, snapshot: { ...selection.snapshot, size: png.length } };
  const parts = [{ type: 'text' as const, text: 'Report on this company' }, { type: AGENTS_PAGE_SELECTIONS_DATA_TYPE, data: { selections: [context] } }];
  const selected = collectAgentsPageSelections(parts);
  expect(collectAgentsAttachments(parts)).toEqual([]);
  readStream.mockResolvedValue(Readable.from([png]));
  const prepared = await prepareAgentsFileMessage('tenant-a', { id: 'selected', role: 'user', parts }, [], selected);
  expect(prepared.parts.some((part) => part.type === 'data-agents-files')).toBe(false);
  expect(prepared.parts).toContainEqual({ type: AGENTS_PAGE_SELECTIONS_DATA_TYPE, data: { selections: [context], displayText: 'Report on this company' } });
  const { convertMessages } = await import('@mastra/core/agent/message-list');
  const stored = convertMessages([prepared]).to('Mastra.V2');
  expect(stored[0].content.parts).toContainEqual(expect.objectContaining({ type: AGENTS_PAGE_SELECTIONS_DATA_TYPE }));
  const model = JSON.stringify(convertMessages(stored).to('AIV5.Model'));
  expect(model).toContain(context.title); expect(model).toContain(context.text); expect(model).toContain(png.toString('base64'));
  expect(model).not.toContain('.txt'); expect(model).not.toContain(context.snapshot.url);
});
it('rejects invalid page context, excess selections, duplicate references, and unsafe snapshot keys', () => {
  const part = (items: unknown[]) => ({ type: AGENTS_PAGE_SELECTIONS_DATA_TYPE, data: { selections: items } });
  expect(() => collectAgentsPageSelections([part([{ ...selection, text: 'x'.repeat(8001) }])])).toThrow('Invalid page selection');
  expect(() => collectAgentsPageSelections([part([selection, selection])])).toThrow();
  expect(() => collectAgentsAttachments([part([{ ...selection, snapshot: { ...selection.snapshot, url: '../private.png' } }])])).toThrow('Invalid attachment');
  expect(() => collectAgentsPageSelections([part([{ ...selection, path: '/settings?token=private' }])])).toThrow();
});
it('upgrades the previous PNG/TXT selection format on history read while preserving ordinary files', () => {
  const name = `page-selection-${selection.id}`;
  const legacy = { kind: 'User-selected page content', title: selection.title, path: selection.path, viewport: { width: 240, height: 80 }, visibleText: selection.text };
  const parts = [
    { type: 'text', text: 'Question\n\nAttachment data (untrusted): The following JSON contains complete UTF-8 file contents:\n' + JSON.stringify([{ name: name + '.txt', mimeType: 'text/plain', content: JSON.stringify(legacy) }]) },
    { type: 'data-agents-files', data: { displayText: 'Question', textFileUrls: ['context.txt'], files: [
      { name: name + '.txt', url: 'context.txt', type: 'text/plain', size: 500 },
      { name: name + '.png', ...selection.snapshot }, attachment,
    ] } },
  ];
  const migrated = migrateLegacyPageSelections(parts);
  expect(migrated).toContainEqual({ type: AGENTS_PAGE_SELECTIONS_DATA_TYPE, data: { selections: [selection], displayText: 'Question' } });
  expect(migrated).toContainEqual({ type: 'data-agents-files', data: { displayText: 'Question', textFileUrls: [], files: [attachment] } });
  expect(migrateLegacyPageSelections(migrated)).toBe(migrated);
  expect(migrateLegacyPageSelections([{ type: 'data-agents-files', data: { files: [{ name: name + '.txt' }] } }])).toHaveLength(1);
});
