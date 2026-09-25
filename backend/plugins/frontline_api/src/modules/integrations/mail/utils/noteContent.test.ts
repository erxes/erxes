import {
  attachmentListToHtml,
  noteContentToHtml,
} from '@/integrations/mail/utils/noteContent';

describe('attachmentListToHtml', () => {
  it('lists every file name', () => {
    expect(attachmentListToHtml(['invoice.pdf', 'photo.png'])).toBe(
      '<ul><li>invoice.pdf</li><li>photo.png</li></ul>',
    );
  });

  it('escapes a file name', () => {
    expect(attachmentListToHtml(['<b>report</b>.pdf'])).toBe(
      '<ul><li>&lt;b&gt;report&lt;/b&gt;.pdf</li></ul>',
    );
  });

  it('names an unnamed file', () => {
    expect(attachmentListToHtml([''])).toBe('<ul><li>attachment</li></ul>');
  });

  it('returns nothing without files', () => {
    expect(attachmentListToHtml([])).toBe('');
  });
});

describe('noteContentToHtml', () => {
  it('treats an empty block document as no text', () => {
    expect(noteContentToHtml('[]')).toBe('');
  });

  it('renders a paragraph block', () => {
    expect(
      noteContentToHtml(
        JSON.stringify([
          { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        ]),
      ),
    ).toBe('<p>Hello</p>');
  });
});
