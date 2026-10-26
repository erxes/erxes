import { REPORT_CREATION_SKILL } from '../skills/reportCreation';

describe('interactive report skill', () => {
  it('requires formula-driven what-if charts without enabling generated JavaScript', () => {
    const { instructions } = REPORT_CREATION_SKILL;
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
});
