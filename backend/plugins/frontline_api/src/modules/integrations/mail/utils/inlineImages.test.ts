import { inlineStorageImages } from '@/integrations/mail/utils/inlineImages';

const sequence = () => {
  let next = 0;

  return () => {
    next += 1;
    return `img-${next}`;
  };
};

describe('inlineStorageImages', () => {
  it('turns a storage key into an inline cid attachment', () => {
    expect(
      inlineStorageImages(
        '<p><img src="0.8123abc-screenshot.png" alt="" /></p>',
        sequence(),
      ),
    ).toEqual({
      html: '<p><img src="cid:img-1@erxes" alt="" /></p>',
      attachments: [
        {
          name: '0.8123abc-screenshot.png',
          url: '0.8123abc-screenshot.png',
          type: 'image/png',
          contentId: 'img-1@erxes',
          disposition: 'inline',
        },
      ],
    });
  });

  it('leaves public, data, cid and relative sources alone', () => {
    const html = [
      '<img src="https://cdn.example.com/logo.png" />',
      '<img src="data:image/png;base64,AAAA" />',
      '<img src="cid:already@mail" />',
      '<img src="/read-file?key=photo.png" />',
    ].join('');

    expect(inlineStorageImages(html, sequence())).toEqual({
      html,
      attachments: [],
    });
  });

  it('attaches a key once when the note shows it twice', () => {
    const { html, attachments } = inlineStorageImages(
      '<img src="photo.jpg" /><img src="photo.jpg" />',
      sequence(),
    );

    expect(html).toBe(
      '<img src="cid:img-1@erxes" /><img src="cid:img-1@erxes" />',
    );
    expect(attachments).toHaveLength(1);
    expect(attachments[0].type).toBe('image/jpeg');
  });

  it('reads an escaped key and keeps the folder out of the file name', () => {
    const { attachments } = inlineStorageImages(
      '<img src="uploads/a&amp;b.webp" />',
      sequence(),
    );

    expect(attachments[0]).toMatchObject({
      name: 'a&b.webp',
      url: 'uploads/a&b.webp',
      type: 'image/webp',
    });
  });

  it('returns an empty body untouched', () => {
    expect(inlineStorageImages('', sequence())).toEqual({
      html: '',
      attachments: [],
    });
  });
});
