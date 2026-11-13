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

  it('marks only the renderer stylesheet as trusted', () => {
    const source = buildSandboxedSrcDoc(
      '<html><head><style data-agent-renderer>p{color:red}</style></head><body><p data-agent-renderer>Report</p></body></html>',
    );
    expect(source.match(/data-agent-renderer/g)).toHaveLength(1);
    expect(source.indexOf('data-agent-renderer')).toBeLessThan(
      source.indexOf('p{color:red}'),
    );
  });

  it('keeps dashboard elements and styles them from the trusted renderer sheet', () => {
    const source = buildSandboxedSrcDoc(
      '<ul class="kpis"><li class="kpi"><span>Pipeline</span><strong>₮174M</strong><small class="up">+12%</small></li></ul><ul class="bars"><li><span>Sales</span><span class="bar" style="width:62%"></span><span>₮1.2M</span></li></ul><meter min="0" max="100" low="30" high="70" optimum="80" value="62"></meter><progress max="100" value="40"></progress><details open><summary>Method</summary><p>Computed from 62 deals.</p></details><svg viewBox="0 0 10 10"><rect class="mark baseline" width="4" height="10"/></svg>',
    );
    const body = new DOMParser().parseFromString(source, 'text/html').body;
    expect(body.querySelector('.kpis .kpi strong')?.textContent).toBe('₮174M');
    expect(body.querySelector('.bar')?.getAttribute('style')).toBe('width:62%');
    const meter = body.querySelector('meter');
    for (const name of ['min', 'max', 'low', 'high', 'optimum', 'value'])
      expect(meter?.hasAttribute(name)).toBe(true);
    expect(body.querySelector('progress')?.getAttribute('value')).toBe('40');
    expect(body.querySelector('details')?.hasAttribute('open')).toBe(true);
    expect(body.querySelector('summary')?.textContent).toBe('Method');
    expect(body.querySelector('rect')?.getAttribute('class')).toBe(
      'mark baseline',
    );
    const renderer = source.slice(
      source.indexOf('<style data-agent-renderer>'),
      source.indexOf('</style>'),
    );
    for (const selector of [
      '.kpis',
      '.kpi strong',
      '.bars li',
      '.bar.baseline',
      'svg .mark',
      'meter',
      'progress',
      'summary',
      '.up',
      '.down',
    ])
      expect(renderer).toContain(selector);
  });

  it('degrades legacy interactive chart containers to their fallback HTML', () => {
    const source = buildSandboxedSrcDoc(
      '<div data-agent-chart="{&quot;title&quot;:&quot;Revenue&quot;}"><p>Baseline revenue: ₮118.9M</p></div>',
    );
    expect(source).not.toContain('data-agent-chart');
    expect(source).toContain('<div><p>Baseline revenue: ₮118.9M</p></div>');
  });
});
