import {
  buildSandboxedSrcDoc,
  MAX_PREVIEW_HEIGHT,
  MIN_PREVIEW_HEIGHT,
  readPreviewHeight,
} from '../htmlSandbox';

describe('HTML sandbox', () => {
  it('installs the restrictive policy before all generated content', () => {
    const html =
      '<script>fetch("https://example.com")</script><html><body>Report</body></html>';
    const source = buildSandboxedSrcDoc(html, 'preview');
    expect(source.indexOf('Content-Security-Policy')).toBeLessThan(
      source.indexOf('<script>'),
    );
    expect(source).toContain("default-src 'none'");
    expect(source).toContain("base-uri 'none'");
    expect(source).toContain("form-action 'none'");
    expect(source).toContain(html);
  });

  it('escapes the resize channel inside the injected script', () => {
    expect(buildSandboxedSrcDoc('<p>Report</p>', '</script>')).not.toContain(
      'const channel = "</script>"',
    );
  });

  it('accepts only finite heights from its own channel and bounds them', () => {
    expect(readPreviewHeight({ channel: 'a', height: 500.2 }, 'a')).toBe(501);
    expect(readPreviewHeight({ channel: 'b', height: 500 }, 'a')).toBeNull();
    expect(
      readPreviewHeight({ channel: 'a', height: Infinity }, 'a'),
    ).toBeNull();
    expect(readPreviewHeight({ channel: 'a', height: '500' }, 'a')).toBeNull();
    expect(readPreviewHeight(null, 'a')).toBeNull();
    expect(readPreviewHeight({ channel: 'a', height: -10 }, 'a')).toBe(
      MIN_PREVIEW_HEIGHT,
    );
    expect(readPreviewHeight({ channel: 'a', height: 999999 }, 'a')).toBe(
      MAX_PREVIEW_HEIGHT,
    );
  });
});
