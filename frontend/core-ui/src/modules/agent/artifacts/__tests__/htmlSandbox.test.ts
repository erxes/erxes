/** @jest-environment jsdom */
import { buildSandboxedSrcDoc } from '../htmlSandbox';

describe('HTML sandbox', () => {
  it('keeps report content while stripping scripts and automatic navigation', () => {
    const source = buildSandboxedSrcDoc(
      '<meta http-equiv="refresh" content="0;url=https://attacker.example"><script>location.href="https://attacker.example"</script><p onclick="alert(1)">Report</p>',
    );
    expect(source).toContain('<p>Report</p>');
    expect(source).not.toContain('<script');
    expect(source).not.toContain('attacker.example');
    expect(source).not.toContain('onclick');
    expect(source).toContain("script-src 'none'");
    expect(source).toContain("default-src 'none'");
    expect(source).toContain("form-action 'none'");
  });

  it('preserves isolated document styles and safe SVG while removing executable content', () => {
    const source = buildSandboxedSrcDoc(
      '<html><head><style>body { color: red }</style></head><body><p style="color: blue">Report</p><svg onload="alert(1)"><circle /></svg></body></html>',
    );
    expect(source).toContain('<p style="color: blue">Report</p>');
    expect(source).toContain('<html');
    expect(source).toContain('<head');
    expect(source).toContain('body { color: red }');
    expect(source).toContain('<svg');
    expect(source).not.toContain('onload');
  });

  it('puts the restrictive policy before model styles and strips embedded documents and fake controls', () => {
    const source = buildSandboxedSrcDoc(
      '<style>@import "https://example.com/a.css";</style><iframe srcdoc="<script>alert(1)</script>"></iframe><form><button>Approve</button></form><p data-id="fake" contenteditable="true">Answer</p>',
    );
    expect(source.indexOf('Content-Security-Policy')).toBeLessThan(
      source.indexOf('@import'),
    );
    expect(source).not.toContain('<iframe');
    expect(source).not.toContain('<button');
    expect(source).not.toContain('<form');
    expect(source).not.toContain('contenteditable');
    expect(source).not.toContain('data-id');
    expect(source).toContain("script-src 'none'");
  });
});
