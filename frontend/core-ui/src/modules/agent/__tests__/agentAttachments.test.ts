import {
  agentsFileKindLabel,
  describeAgentsAttachmentRejections,
  filesFromClipboard,
  fitImageDimensions,
  planAgentsAttachments,
} from '../utils/agentAttachments';

const file = (name: string, size: number, type = '') =>
  new File([new Uint8Array(size)], name, { type });

const clipboard = (files: File[], types: string[]) =>
  ({ files, types }) as unknown as Pick<DataTransfer, 'files' | 'types'>;

describe('planAgentsAttachments', () => {
  it('rejects unsupported types without using a slot and reports overflow', () => {
    const plan = planAgentsAttachments(
      [
        file('archive.zip', 10, 'application/zip'),
        file('a.txt', 4),
        file('b.pdf', 4),
        file('c.png', 4),
      ],
      { remainingSlots: 2, textBytesInUse: 0 },
    );
    expect(plan.unsupported).toEqual(['archive.zip']);
    expect(plan.accepted.map((item) => item.file.name)).toEqual([
      'a.txt',
      'b.pdf',
    ]);
    expect(plan.overflow).toEqual(['c.png']);
  });

  it('applies size, empty and text budget limits as chip errors', () => {
    const plan = planAgentsAttachments(
      [
        file('empty.csv', 0),
        file('huge.pdf', 10 * 1024 * 1024 + 1),
        file('big.md', 64 * 1024 + 1),
        file('fits.json', 40 * 1024),
        file('over.csv', 40 * 1024),
      ],
      { remainingSlots: 5, textBytesInUse: 60 * 1024 },
    );
    expect(plan.accepted.map((item) => item.error)).toEqual([
      'File is empty.',
      'File is too large. Files must be at most 10 MiB.',
      'Text attachments must be at most 64 KiB each. Split the file and retry.',
      undefined,
      'Text attachments must total at most 128 KiB per message. Send fewer files.',
    ]);
  });

  it('resizes large photos but rejects large GIFs', () => {
    const plan = planAgentsAttachments(
      [
        file('photo.jpg', 3 * 1024 * 1024),
        file('small.png', 1024),
        file('loop.gif', 3 * 1024 * 1024),
      ],
      { remainingSlots: 5, textBytesInUse: 0 },
    );
    expect(plan.accepted.map(({ resize, error }) => ({ resize, error }))).toEqual(
      [
        { resize: true, error: undefined },
        { resize: false, error: undefined },
        { resize: false, error: 'GIF images must be at most 2 MiB.' },
      ],
    );
  });

  it('accepts every document format the agent can read', () => {
    const plan = planAgentsAttachments(
      ['deck.pptx', 'notes.odt', 'budget.ods', 'pitch.odp', 'memo.rtf'].map(
        (name) => file(name, 10),
      ),
      { remainingSlots: 5, textBytesInUse: 0 },
    );
    expect(plan.unsupported).toEqual([]);
    expect(plan.accepted.map((item) => [item.mimeType, item.error])).toEqual([
      [
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        undefined,
      ],
      ['application/vnd.oasis.opendocument.text', undefined],
      ['application/vnd.oasis.opendocument.spreadsheet', undefined],
      ['application/vnd.oasis.opendocument.presentation', undefined],
      ['application/rtf', undefined],
    ]);
  });

  it('still rejects legacy binary Office formats', () => {
    const plan = planAgentsAttachments(
      [file('old.doc', 10, 'application/msword'), file('old.ppt', 10)],
      { remainingSlots: 5, textBytesInUse: 0 },
    );
    expect(plan.unsupported).toEqual(['old.doc', 'old.ppt']);
  });

  it('uses the browser type when the name has no known extension', () => {
    const plan = planAgentsAttachments([file('Screenshot', 10, 'image/png')], {
      remainingSlots: 1,
      textBytesInUse: 0,
    });
    expect(plan.accepted[0].mimeType).toBe('image/png');
  });
});

describe('describeAgentsAttachmentRejections', () => {
  it('explains unsupported types and the per-message limit', () => {
    expect(
      describeAgentsAttachmentRejections({ unsupported: [], overflow: [] }),
    ).toBeUndefined();
    expect(
      describeAgentsAttachmentRejections({
        unsupported: ['a.zip'],
        overflow: ['x.png', 'y.png'],
      }),
    ).toBe(
      "a.zip isn't a supported type. Attach images, PDF, Word, Excel, PowerPoint, OpenDocument, RTF, CSV, text, Markdown or JSON. Up to 5 files can be attached per message; 2 files weren't added.",
    );
    expect(
      describeAgentsAttachmentRejections({
        unsupported: ['a.zip', 'b.exe'],
        overflow: [],
      }),
    ).toMatch(/^2 files aren't supported types\./);
  });
});

describe('filesFromClipboard', () => {
  const now = new Date(2026, 9, 25, 9, 5, 7);

  it('names pasted screenshots and keeps real file names', () => {
    const files = filesFromClipboard(
      clipboard(
        [
          file('image.png', 3, 'image/png'),
          file('report.pdf', 3, 'application/pdf'),
          file('', 3, 'image/jpeg'),
        ],
        ['Files'],
      ),
      now,
    );
    expect(files.map((item) => item.name)).toEqual([
      'pasted-image-20261025-090507.png',
      'report.pdf',
      'pasted-image-20261025-090507-2.jpg',
    ]);
    expect(files[0].type).toBe('image/png');
  });

  it('attaches Finder copies and browser image copies', () => {
    expect(
      filesFromClipboard(
        clipboard([file('notes.txt', 3)], ['text/plain', 'Files']),
      ),
    ).toHaveLength(1);
    expect(
      filesFromClipboard(
        clipboard([file('image.png', 3, 'image/png')], ['text/html', 'Files']),
      ),
    ).toHaveLength(1);
  });

  it('keeps rich text copies (spreadsheet cells, documents) as text', () => {
    expect(
      filesFromClipboard(
        clipboard(
          [file('image.png', 3, 'image/png')],
          ['text/plain', 'text/html', 'Files'],
        ),
      ),
    ).toEqual([]);
    expect(filesFromClipboard(clipboard([], ['text/plain']))).toEqual([]);
    expect(filesFromClipboard(null)).toEqual([]);
  });
});

describe('display helpers', () => {
  it('labels each accepted file type', () => {
    expect(
      agentsFileKindLabel(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toBe('Excel');
    expect(agentsFileKindLabel('application/zip')).toBe('File');
    expect(
      agentsFileKindLabel(
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ),
    ).toBe('PowerPoint');
    expect(
      agentsFileKindLabel('application/vnd.oasis.opendocument.spreadsheet'),
    ).toBe('OpenDocument sheet');
    expect(agentsFileKindLabel('application/rtf')).toBe('Rich text');
    expect(agentsFileKindLabel('image/png')).toBe('Image');
  });

  it('fits images inside the longest edge without upscaling', () => {
    expect(fitImageDimensions(4000, 3000, 2048)).toEqual({
      width: 2048,
      height: 1536,
    });
    expect(fitImageDimensions(1000, 3000, 1500)).toEqual({
      width: 500,
      height: 1500,
    });
    expect(fitImageDimensions(800, 600, 2048)).toEqual({
      width: 800,
      height: 600,
    });
  });
});
