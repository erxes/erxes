import type { UIMessage } from 'ai';

import {
  AGENTS_FILES_DATA_TYPE,
  agentsFilesPart,
  agentsFilesNotice,
  mimeFromFile,
  readAgentsFilesPart,
} from '../agentsFiles';
import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';

const file = {
  name: 'products.csv',
  url: 'private-products.csv',
  type: 'text/csv',
  size: 12,
};

describe('mimeFromFile', () => {
  it('normalizes platform-specific CSV and Markdown MIME aliases', () => {
    expect(
      mimeFromFile({ name: 'rows.csv', type: 'application/vnd.ms-excel' }),
    ).toBe('text/csv');
    expect(mimeFromFile({ name: 'notes.md', type: 'text/x-markdown' })).toBe(
      'text/markdown',
    );
  });
});

describe('data-agents-files parts', () => {
  it('keeps extracted contents out of the stored prompt bubble', () => {
    const part = {
      type: AGENTS_FILES_DATA_TYPE,
      data: {
        files: [file],
        textFileUrls: [file.url],
        displayText: 'Add these products',
        contentsNotRead: false,
      },
    };
    const mapped = mapStoredMessagesToUIMessages([
      {
        id: 'm1',
        role: 'user',
        createdAt: '2026-09-07T00:00:00.000Z',
        content: {
          format: 2,
          parts: [
            {
              type: 'text',
              text: 'Add these products plus extracted CSV contents',
            },
            part,
          ],
        },
      },
    ]);
    expect(mapped[0].parts[0]).toEqual({
      type: 'text',
      text: 'Add these products',
    });
    expect(agentsFilesNotice(mapped[0].parts[1])).toBe(
      'Text contents supplied to the AI.',
    );
    expect(mapped[0].parts.flatMap(readAgentsFilesPart)).toEqual([file]);
  });

  it('does not show a send-time format notice under the chip', () => {
    expect(agentsFilesNotice(agentsFilesPart([file]))).toBe('');
    expect(
      agentsFilesNotice({
        type: AGENTS_FILES_DATA_TYPE,
        data: { files: [file], contentsNotRead: true },
      }),
    ).toBe('');
  });

  it('reads attachment metadata from a user message', () => {
    const message: UIMessage = {
      id: 'm1',
      role: 'user',
      parts: [
        { type: 'text', text: 'Uploaded files' },
        agentsFilesPart([file]),
      ],
    };
    expect(message.parts.flatMap(readAgentsFilesPart)).toEqual([file]);
  });
});

it('identifies a selected screenshot and its context as model-visible contents', () => {
  const text = {
    name: 'page-selection-id.txt',
    url: 'selection.txt',
    type: 'text/plain',
    size: 10,
  };
  const image = {
    name: 'page-selection-id.png',
    url: 'selection.png',
    type: 'image/png',
    size: 100,
  };
  expect(
    agentsFilesNotice({
      type: AGENTS_FILES_DATA_TYPE,
      data: { files: [image, text], textFileUrls: [text.url] },
    }),
  ).toBe('Image and text contents supplied to the AI.');
});
