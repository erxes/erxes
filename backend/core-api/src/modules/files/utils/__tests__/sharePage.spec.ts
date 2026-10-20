import {
  renderShareErrorPage,
  renderShareGonePage,
  renderSharePage,
} from '../sharePage';

const file = {
  name: 'Report.xlsx',
  size: 1536,
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ext: 'xlsx',
  downloadUrl: '/files/share/abc/download?x=1&y=2',
};

describe('renderSharePage', () => {
  it('escapes the file name in the title and heading', () => {
    const html = renderSharePage({
      ...file,
      name: `<script>alert("x")</script> & 'co'`,
      lang: 'en',
    });
    const escaped =
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;co&#39;';

    expect(html).not.toContain('<script>');
    expect(html).toContain(`<title>${escaped}</title>`);
    expect(html).toContain(`<h1>${escaped}</h1>`);
  });

  it('escapes the download link', () => {
    expect(renderSharePage({ ...file, lang: 'en' })).toContain(
      'href="/files/share/abc/download?x=1&amp;y=2"',
    );
  });

  it('writes the page in English', () => {
    const html = renderSharePage({ ...file, lang: 'en' });

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('Spreadsheet · 1.5 KB');
    expect(html).toContain('Download</a>');
    expect(html).toContain('Shared with you through erxes');
  });

  it('writes the page in Mongolian', () => {
    const html = renderSharePage({ ...file, lang: 'mn' });

    expect(html).toContain('<html lang="mn">');
    expect(html).toContain('Хүснэгт · 1.5 KB');
    expect(html).toContain('Татаж авах</a>');
    expect(html).toContain('erxes-ээр тантай хуваалцсан');
  });

  it('falls back to a generic file kind and the mime subtype as badge', () => {
    const html = renderSharePage({
      ...file,
      mimeType: 'application/octet-stream',
      ext: undefined,
      size: 10,
      lang: 'en',
    });

    expect(html).toContain('>OCTE</div>');
    expect(html).toContain('File · 10 B');
  });
});

describe('renderShareGonePage', () => {
  it.each([
    ['en', 'This link is no longer available'],
    ['mn', 'Энэ link идэвхгүй болсон'],
  ] as const)('explains a dead link in %s', (lang, text) => {
    const html = renderShareGonePage(lang);

    expect(html).toContain(`<title>${text}</title>`);
    expect(html).toContain(`<h1>${text}</h1>`);
  });
});

describe('renderShareErrorPage', () => {
  it.each([
    ['en', 'The link still works'],
    ['mn', 'Link хүчинтэй хэвээр байна'],
  ] as const)('tells a %s visitor the link still works', (lang, text) => {
    expect(renderShareErrorPage(lang)).toContain(text);
  });
});
