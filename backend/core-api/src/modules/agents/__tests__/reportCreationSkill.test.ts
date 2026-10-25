import { REPORT_CREATION_SKILL } from '../skills/reportCreation';

describe('interactive report skill', () => {
  const { instructions } = REPORT_CREATION_SKILL;

  it('requires formula-driven what-if charts without enabling generated JavaScript', () => {
    expect(instructions).toContain(
      'Every created or revised HTML report must include',
    );
    expect(instructions).toContain('data-agent-chart');
    expect(instructions).toContain('Formulas are postfix token arrays');
    expect(instructions).toContain('Generated scripts remain blocked');
    expect(instructions).toContain('never executable model code');
    expect(instructions).toContain('downloaded HTML retains that summary');
    expect(instructions).toContain('rather than fabricate');
  });

  it('documents the optional display fields with a valid example', () => {
    for (const field of [
      '"format":"percent"',
      '"format":"currency","currency":"USD"',
      '"better":"lower"',
      '"description":',
      'decimals is an integer 0–6',
      'older specs with only unit stay valid',
    ])
      expect(instructions).toContain(field);
    const example = instructions.match(/The JSON shape is (\{.*?\})\. This/);
    expect(example).not.toBeNull();
    const spec = JSON.parse(example?.[1] ?? '');
    expect(spec.outputs).toHaveLength(2);
    expect(spec.inputs[1].min).toBeGreaterThan(0);
  });

  it('leads reports with visuals and keeps prose to captions and takeaways', () => {
    expect(instructions).toContain('Lead with visuals, not paragraphs');
    expect(instructions).toContain('KPI summary row');
    expect(instructions).toContain('two to four bullet takeaways');
    expect(instructions).toContain(
      'do not restate in prose what this card already shows',
    );
    expect(instructions).toContain('limitations in the assumption field');
  });
});
