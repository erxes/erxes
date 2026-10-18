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
});
