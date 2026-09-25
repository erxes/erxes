import { model } from 'mongoose';
import { noteSchema } from '@/ticket/db/definitions/note';

const Note = model('NoteSchemaTest', noteSchema);

const validate = (doc: Record<string, unknown>) =>
  new Note({
    contentId: 'ticket-1',
    createdBy: 'user-1',
    ...doc,
  }).validateSync();

describe('noteSchema content', () => {
  it('accepts a note with text', () => {
    expect(validate({ content: '<p>Hello</p>' })).toBeUndefined();
  });

  it('accepts a note that carries only attachments', () => {
    expect(
      validate({
        content: '',
        attachments: [
          {
            name: 'invoice.pdf',
            url: 'files/invoice.pdf',
            type: 'application/pdf',
            size: 2048,
          },
        ],
      }),
    ).toBeUndefined();
  });

  it('accepts an empty note created from a mail message', () => {
    expect(
      validate({ content: '', mailMessageId: 'message-1' }),
    ).toBeUndefined();
  });

  it('rejects a note with neither text nor attachments', () => {
    expect(validate({ content: '' })?.errors.content).toBeDefined();
  });
});
