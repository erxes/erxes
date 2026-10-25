import { REPORT_CREATION_SKILL } from '../skills/reportCreation';

describe('dashboard report skill', () => {
  const { instructions } = REPORT_CREATION_SKILL;

  it('makes reports dashboard-first with short takeaways', () => {
    expect(instructions).toContain(
      'Every created or revised HTML report is a dashboard',
    );
    expect(instructions).toContain('<p class="scope">');
    expect(instructions).toContain('two to four bullet takeaways');
    expect(instructions).toContain('Never write introductions');
  });

  it('documents only renderer-styled HTML, never scripts or controls', () => {
    for (const vocabulary of [
      'class="kpis"',
      'class="bars"',
      'class="bar baseline"',
      'class mark',
      '<tr class="highlight">',
      '<meter',
      '<details><summary>',
    ])
      expect(instructions).toContain(vocabulary);
    expect(instructions).toContain('Do not write scripts');
    expect(instructions).toContain('sliders or other fake controls');
    expect(instructions).not.toContain('data-agent-chart');
    expect(instructions).not.toMatch(/postfix|formula token/i);
  });

  it('has the agent compute what-if scenarios itself from verified data', () => {
    expect(instructions).toContain(
      'Correctness comes from your own computation',
    );
    expect(instructions).toContain('execute_typescript');
    expect(instructions).toContain('compute the scenarios yourself');
    expect(instructions).toContain('baseline, −20%, +20%');
    expect(instructions).toContain('once, in the table caption');
    expect(instructions).toContain('they ask in chat and you recompute');
    expect(instructions).toContain('rather than fabricate');
  });
});
