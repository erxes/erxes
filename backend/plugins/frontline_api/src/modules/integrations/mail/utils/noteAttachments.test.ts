import {
  toMailAttachments,
  toNoteAttachments,
  toUnsavedAttachments,
} from '@/integrations/mail/utils/noteAttachments';
import { IMailAttachment } from '@/integrations/mail/@types/message';

const attachment = (
  overrides: Partial<IMailAttachment> = {},
): IMailAttachment => ({
  filename: 'invoice.pdf',
  mimeType: 'application/pdf',
  type: 'application/pdf',
  size: 2048,
  url: 'files/invoice.pdf',
  ...overrides,
});

describe('toNoteAttachments', () => {
  it('maps a stored attachment to the note attachment shape', () => {
    expect(
      toNoteAttachments({ body: '<p>Hi</p>', attachments: [attachment()] }),
    ).toEqual([
      {
        name: 'invoice.pdf',
        url: 'files/invoice.pdf',
        type: 'application/pdf',
        size: 2048,
      },
    ]);
  });

  it('returns nothing when the message has no attachments', () => {
    expect(toNoteAttachments({ body: '<p>Hi</p>' })).toEqual([]);
  });

  it('skips an attachment that could not be stored', () => {
    expect(
      toNoteAttachments({
        body: '',
        attachments: [
          attachment({ error: 'the attachment could not be stored' }),
        ],
      }),
    ).toEqual([]);
  });

  it('skips an attachment without a stored url', () => {
    expect(
      toNoteAttachments({
        body: '',
        attachments: [attachment({ url: undefined })],
      }),
    ).toEqual([]);
  });

  it('skips an inline image the body already shows', () => {
    expect(
      toNoteAttachments({
        body: '<p><img src="files/logo.png" /></p>',
        attachments: [
          attachment({
            filename: 'logo.png',
            mimeType: 'image/png',
            url: 'files/logo.png',
            contentId: 'logo@mail',
            disposition: 'inline',
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('keeps an inline attachment the body never references', () => {
    expect(
      toNoteAttachments({
        body: '<p>See the attached file</p>',
        attachments: [
          attachment({ contentId: 'invoice@mail', disposition: 'inline' }),
        ],
      }),
    ).toHaveLength(1);
  });

  it('falls back to a generic mime type and zero size', () => {
    expect(
      toNoteAttachments({
        body: '',
        attachments: [
          attachment({ mimeType: undefined, type: undefined, size: undefined }),
        ],
      }),
    ).toEqual([
      {
        name: 'invoice.pdf',
        url: 'files/invoice.pdf',
        type: 'application/octet-stream',
        size: 0,
      },
    ]);
  });
});

describe('toMailAttachments', () => {
  it('passes a note attachment through as a mail attachment', () => {
    expect(
      toMailAttachments([
        {
          name: 'invoice.pdf',
          url: 'files/invoice.pdf',
          type: 'application/pdf',
          size: 2048,
        },
      ]),
    ).toEqual([
      {
        name: 'invoice.pdf',
        url: 'files/invoice.pdf',
        type: 'application/pdf',
        size: 2048,
      },
    ]);
  });

  it('skips an attachment that never finished uploading', () => {
    expect(
      toMailAttachments([
        { name: 'draft.pdf', url: '', type: 'application/pdf', size: 10 },
      ]),
    ).toEqual([]);
  });

  it('returns nothing for a note without attachments', () => {
    expect(toMailAttachments()).toEqual([]);
  });
});

describe('toUnsavedAttachments', () => {
  const createdAt = new Date('2026-09-24T08:58:45.000Z');
  const workerUrl = 'https://worker.example.com/attachments/erxes/1/0?token=t';

  it('lists a file that failed to store with its temporary link and expiry', () => {
    expect(
      toUnsavedAttachments({
        body: '<p>test</p>',
        createdAt,
        attachments: [
          attachment({
            url: workerUrl,
            error: 'the attachment could not be stored',
          }),
        ],
      }),
    ).toEqual([
      {
        name: 'invoice.pdf',
        url: workerUrl,
        type: 'application/pdf',
        size: 2048,
        error: 'the attachment could not be stored',
        expiresAt: new Date('2026-10-08T08:58:45.000Z'),
      },
    ]);
  });

  it('ignores a file that was stored', () => {
    expect(
      toUnsavedAttachments({
        body: '',
        createdAt,
        attachments: [attachment()],
      }),
    ).toEqual([]);
  });

  it('ignores a failed inline image the body already shows', () => {
    expect(
      toUnsavedAttachments({
        body: `<img src="${workerUrl}" />`,
        createdAt,
        attachments: [
          attachment({
            url: workerUrl,
            contentId: 'logo@mail',
            error: 'the attachment could not be stored',
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('keeps a failed file that has no link at all', () => {
    const [unsaved] = toUnsavedAttachments({
      body: '',
      createdAt,
      attachments: [
        attachment({
          url: undefined,
          error: 'the message carried no content for this attachment',
        }),
      ],
    });

    expect(unsaved.url).toBeNull();
  });
});
