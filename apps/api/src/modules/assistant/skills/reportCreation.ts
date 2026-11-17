import type { Skill } from './skills';

export const REPORT_SKILL: Skill = {
  name: 'create-report',
  description:
    'Write or revise an HTML report or dashboard with createArtifact, including what-if scenario comparisons.',
  instructions: `An HTML report is a dashboard, not an essay. Use this order: a one-line scope (<p class="scope">period · filters · currency · record count</p>); a KPI row of the three to six most important numbers; charts and compact tables for breakdowns, trends and rankings; then two to four one-sentence takeaways that state a finding with its number. Each visual gets at most a one-sentence caption. Compute every number from what your tools returned (with runCode when it is available); never invent trends or values, and note missing or partial data in a caption.

The preview styles semantic HTML and these classes; use them instead of your own visual CSS:
- KPI row: <ul class="kpis"><li class="kpi"><span>Label</span><strong>₮118.9M</strong><small class="up">+8% vs Aug</small></li></ul>. Add up or down to the comparison for good or bad changes.
- Bar list: <ul class="bars"><li><span>Label</span><span class="bar" style="width:62%"></span><span>₮1.2M</span></li></ul>, each width = value ÷ largest value × 100. Add baseline to a comparison bar, and up or down only for gains or losses. A legend is <ul class="legend"><li><span class="bar baseline"></span>Baseline</li><li><span class="bar"></span>Scenario</li></ul>.
- Inline SVG charts in a <figure> with a <figcaption>: a viewBox, role="img" and an aria-label that sums up the data; class mark for bars (with baseline, up or down), line for line series, axis and gridline for axes; value labels in <text>.
- Tables with <caption>, <thead> and <tbody>; up or down on a cell colours a change; <tr class="highlight"> marks the baseline or the member's case.
No scripts, event handlers, forms, buttons or outside resources: the preview blocks them and createArtifact refuses them. Keep backgrounds transparent so the report reads in light and dark themes.

What-if questions get computed scenarios (for example baseline, −20%, +20% and the member's case) in a comparison table with the baseline highlighted, assumptions stated once in its caption, and results labelled as estimates. Write record references as text beside the data they describe, never inside attributes or SVG. Use plain words, and explain a necessary technical term in parentheses.`,
};
