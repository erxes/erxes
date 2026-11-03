import { splitArtifacts } from '../parseArtifacts';

describe('splitArtifacts', () => {
  it('decodes legacy fences without granting a file presentation', () => {
    const reply = splitArtifacts('```html Hello\n<p>Hello!</p>\n```');
    expect(reply[0]).toMatchObject({
      kind: 'artifact',
      artifact: { title: 'Hello', content: '<p>Hello!</p>' },
    });
    const report = splitArtifacts(
      '```html artifact Sales report\n<h1>Sales</h1>\n```',
    );
    expect(report[0]).toMatchObject({
      kind: 'artifact',
      artifact: {
        title: 'artifact Sales report',
        content: '<h1>Sales</h1>',
      },
    });
  });

  it('treats old deliverable markers as text metadata while decoding streaming HTML', () => {
    expect(
      splitArtifacts('~~~HTML ARTIFACT Monthly sales\n<section>'),
    ).toMatchObject([
      {
        kind: 'artifact',
        artifact: {
          title: 'ARTIFACT Monthly sales',
          complete: false,
        },
      },
    ]);
  });

  it('extracts a complete html artifact with surrounding text', () => {
    const text = [
      'Here is your page:',
      '',
      '```html sales-dashboard',
      '<h1>Hello</h1>',
      '```',
      '',
      'Enjoy!',
    ].join('\n');

    const segments = splitArtifacts(text);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ kind: 'text', text: 'Here is your page:' });
    if (segments[1].kind !== 'artifact') throw new Error('expected artifact');
    expect(segments[1].artifact.type).toBe('html');
    expect(segments[1].artifact.title).toBe('sales-dashboard');
    expect(segments[1].artifact.filename).toBe('sales-dashboard.html');
    expect(segments[1].artifact.content).toBe('<h1>Hello</h1>');
    expect(segments[2]).toEqual({ kind: 'text', text: 'Enjoy!' });
  });

  it('matches artifact languages case-insensitively', () => {
    const segments = splitArtifacts('```HTML\n<p>x</p>\n```');
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      kind: 'artifact',
      artifact: { type: 'html', complete: true, filename: 'report-1.html' },
    });
  });

  it('keeps an unclosed artifact separate from prose without previewing it', () => {
    const text = 'before\n```xlsx Q3\na,b\n1,2\n';
    const segments = splitArtifacts(text);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({ kind: 'text', text: 'before' });
    expect(segments[1]).toMatchObject({
      kind: 'artifact',
      artifact: { type: 'xlsx', complete: false, content: 'a,b\n1,2\n' },
    });
  });

  it('leaves non-allow-listed code fences untouched', () => {
    const text = '```ts\nconst x = 1;\n```\nafter';
    const segments = splitArtifacts(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe('text');
    if (segments[0].kind !== 'text') throw new Error('expected text');
    expect(segments[0].text).toContain('```ts');
    expect(segments[0].text).toContain('after');
  });

  it('normalizes CRLF line endings', () => {
    const segments = splitArtifacts(
      '```docx Note\r\nHello\r\nWorld\r\n```\r\n',
    );
    expect(segments).toHaveLength(1);
    if (segments[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(segments[0].artifact.content).toBe('Hello\nWorld');
  });

  it('supports tilde fences', () => {
    const segments = splitArtifacts('~~~html\n<p>x</p>\n~~~');
    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe('artifact');
  });

  it('honors the longer-or-equal closing fence rule', () => {
    const fourOpen = '````html\n```\nnot closed by three\n````\n';
    const segments = splitArtifacts(fourOpen);
    expect(segments).toHaveLength(1);
    if (segments[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(segments[0].artifact.content).toBe('```\nnot closed by three');

    // A tilde line is plain content; with no backtick closer the fence stays open.
    const mismatched = splitArtifacts('```html\n~~~\nnoise\n');
    expect(mismatched).toHaveLength(1);
    expect(mismatched[0]).toMatchObject({
      kind: 'artifact',
      artifact: { complete: false },
    });
  });

  it('does not close on a fence line carrying an info string', () => {
    const text = '```html\n<p>a</p>\n```js\nstill inside\n```\n';
    const segments = splitArtifacts(text);
    expect(segments).toHaveLength(1);
    if (segments[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(segments[0].artifact.content).toContain('still inside');
  });

  it('extracts multiple artifacts with interleaved text and ordinals in defaults', () => {
    const text = [
      '```xlsx',
      'a,b',
      '```',
      'middle',
      '```pdf',
      'Doc body',
      '```',
    ].join('\n');

    const segments = splitArtifacts(text);

    expect(segments).toHaveLength(3);
    if (segments[0].kind !== 'artifact' || segments[2].kind !== 'artifact') {
      throw new Error('expected artifacts');
    }
    expect(segments[1]).toEqual({ kind: 'text', text: 'middle' });
    expect(segments[0].artifact.filename).toBe('spreadsheet-1.xlsx');
    expect(segments[2].artifact.filename).toBe('document-1.pdf');
  });

  it('sanitizes titles: quotes stripped, extensions deduped, filename-safe', () => {
    const quoted = splitArtifacts('```xlsx "Q3 Sales"\na,b\n```');
    if (quoted[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(quoted[0].artifact.title).toBe('Q3 Sales');
    expect(quoted[0].artifact.filename).toBe('Q3-Sales.xlsx');

    const withExt = splitArtifacts('```xlsx report.xlsx\na,b\n```');
    if (withExt[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(withExt[0].artifact.filename).toBe('report.xlsx');

    const unsafe = splitArtifacts('```xlsx report: final?\na,b\n```');
    if (unsafe[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(unsafe[0].artifact.filename).toBe('report-final.xlsx');
  });

  it('ignores fences indented inside list items', () => {
    const text = '- item\n    ```html\n    <p>x</p>\n    ```\n';
    const segments = splitArtifacts(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe('text');
  });

  it('treats a bare closing-style fence as a plain code fence', () => {
    const text = '```\ncode\n```';
    const segments = splitArtifacts(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe('text');
  });

  it('keeps an empty artifact body as an artifact', () => {
    const segments = splitArtifacts('```html\n```');
    expect(segments).toHaveLength(1);
    if (segments[0].kind !== 'artifact') throw new Error('expected artifact');
    expect(segments[0].artifact.content).toBe('');
  });
});

describe('HTML generation recovery', () => {
  it('recognizes a standalone document while keeping surrounding prose', () => {
    expect(
      splitArtifacts(
        'Here is the report:\n<!DOCTYPE html>\n<html><head><title>Sales</title></head><body>Report</body></html>\nDone.',
      ),
    ).toMatchObject([
      { kind: 'text', text: 'Here is the report:' },
      {
        kind: 'artifact',
        artifact: { type: 'html', title: 'Sales', complete: true },
      },
      { kind: 'text', text: 'Done.' },
    ]);
  });

  it('does not execute a truncated standalone document', () => {
    expect(
      splitArtifacts('<!doctype html>\n<html><style>body {'),
    ).toMatchObject([{ kind: 'artifact', artifact: { complete: false } }]);
  });

  it('leaves untagged code examples and their nested artifact fences alone', () => {
    const text = '````\n```html\n<h1>Example</h1>\n```\n````';
    expect(splitArtifacts(text)).toEqual([{ kind: 'text', text }]);
  });

  it('leaves indented HTML code examples alone', () => {
    const text = '    <!doctype html>\n    <html><body>Example</body></html>';
    expect(splitArtifacts(text)).toEqual([{ kind: 'text', text }]);
  });

  it('leaves HTML fragments in ordinary prose alone', () => {
    const text = 'Use <strong>bold</strong> here.';
    expect(splitArtifacts(text)).toEqual([{ kind: 'text', text }]);
  });

  it('promotes only when a matching closing fence arrives', () => {
    const text = '```html Report\n<html><body>Report</body></html>\n';
    expect(splitArtifacts(text)[0]).toMatchObject({
      artifact: { complete: false },
    });
    expect(splitArtifacts(text + '```')[0]).toMatchObject({
      artifact: { complete: true },
    });
  });
});
