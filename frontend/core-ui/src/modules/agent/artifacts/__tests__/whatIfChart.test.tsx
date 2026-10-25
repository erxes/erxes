/** @jest-environment jsdom */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { WhatIfChart } from '../WhatIfChart';
import { evaluateChartFormula, parseWhatIfChart } from '../whatIfChartModel';
import { formatWhatIfValue } from '../whatIfFormat';
import { HtmlPreview } from '../HtmlPreview';

jest.mock('../../components/AgentReferenceChip', () => ({
  AgentReferenceChip: () => null,
}));

const example = {
  title: 'Revenue what-if',
  assumption: 'Price held constant; scenario is not a forecast.',
  inputs: [
    { id: 'volume', label: 'Volume', value: 10, min: 0, max: 100, step: 1 },
    {
      id: 'price',
      label: 'Price',
      value: 20,
      min: 0,
      max: 100,
      step: 1,
      unit: 'USD',
    },
  ],
  outputs: [
    { label: 'Revenue', unit: 'USD', formula: ['volume', 'price', '*'] },
  ],
};
const usd = (value: number, sign = false) =>
  formatWhatIfValue(value, { unit: 'USD' }, { sign });

const renderChart = (source: unknown = example) => {
  const spec = parseWhatIfChart(JSON.stringify(source));
  if (!spec) throw new Error('Invalid fixture');
  return render(<WhatIfChart spec={spec} />);
};

it('evaluates arithmetic formulas, not arbitrary JavaScript', () => {
  const values = new Map([
    ['volume', 10],
    ['price', 20],
  ]);
  expect(evaluateChartFormula(['volume', 'price', '*'], values)).toBe(200);
  expect(evaluateChartFormula([10, 20, '-', 2, '/'], values)).toBe(-5);
  expect(evaluateChartFormula([10, 20, 'min', 30, 'max'], values)).toBe(30);
  for (const formula of [
    ['window.alert(1)'],
    ['constructor'],
    ['fetch'],
    [1, 0, '/'],
    [1, '+'],
    [1, 2],
    ['unknown'],
    [1e12, 1e12, '*'],
  ])
    expect(evaluateChartFormula(formula, values)).toBeNull();
  expect(evaluateChartFormula(Array(129).fill(1), values)).toBeNull();
});

it('validates bounds, identifiers, duplicates and complete formulas', () => {
  expect(parseWhatIfChart(JSON.stringify(example))).not.toBeNull();
  for (const invalid of [
    { ...example, inputs: [] },
    { ...example, outputs: [{ label: 'Static', formula: [200] }] },
    { ...example, inputs: [example.inputs[0], example.inputs[0]] },
    { ...example, inputs: [{ ...example.inputs[0], min: 20 }] },
    { ...example, inputs: [{ ...example.inputs[0], step: 0 }] },
    { ...example, inputs: [{ ...example.inputs[0], id: 'min' }] },
    { ...example, outputs: [{ label: 'X', formula: ['document.cookie'] }] },
    { ...example, outputs: [{ label: 'X', formula: ['missing'] }] },
    { ...example, outputs: [{ label: 'X', formula: [1, 2] }] },
    { ...example, outputs: [{ label: 'X', formula: [1, 0, '/'] }] },
  ])
    expect(parseWhatIfChart(JSON.stringify(invalid))).toBeNull();
  expect(parseWhatIfChart('{')).toBeNull();
  expect(parseWhatIfChart(' '.repeat(20_001))).toBeNull();
});

it('accepts optional presentation hints and rejects invalid ones', () => {
  const output = example.outputs[0];
  const input = example.inputs[1];
  const hinted = parseWhatIfChart(
    JSON.stringify({
      ...example,
      inputs: [
        example.inputs[0],
        {
          ...input,
          format: 'currency',
          currency: 'MNT',
          decimals: 0,
          description: 'Average closed value',
        },
      ],
      outputs: [{ ...output, format: 'currency', better: 'lower' }],
    }),
  );
  expect(hinted?.inputs[1]).toMatchObject({ currency: 'MNT', decimals: 0 });
  expect(hinted?.outputs[0].better).toBe('lower');
  for (const invalid of [
    { ...input, format: 'date' },
    { ...input, currency: 'mnt' },
    { ...input, currency: 'MONGOLIA' },
    { ...input, decimals: 7 },
    { ...input, decimals: 1.5 },
    { ...input, description: 'x'.repeat(161) },
  ])
    expect(
      parseWhatIfChart(
        JSON.stringify({ ...example, inputs: [example.inputs[0], invalid] }),
      ),
    ).toBeNull();
  expect(
    parseWhatIfChart(
      JSON.stringify({ ...example, outputs: [{ ...output, better: 'up' }] }),
    ),
  ).toBeNull();
});

it('recalculates KPI, chart and table from sliders and numeric fields, then resets', () => {
  renderChart();
  const reset = screen.getByRole('button', { name: 'Reset scenario' });
  expect(reset).toHaveProperty('disabled', true);
  expect(screen.getByText('What-if · does not change records')).toBeTruthy();
  expect(
    screen.getByRole('img', { name: /^Revenue:/ }).getAttribute('aria-label'),
  ).toContain(`baseline ${usd(200)}, scenario ${usd(200)}`);

  fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), {
    target: { value: '30' },
  });
  expect(reset).toHaveProperty('disabled', false);
  expect(
    screen.getByRole('img', { name: /^Revenue:/ }).getAttribute('aria-label'),
  ).toContain(`baseline ${usd(200)}, scenario ${usd(600)}`);
  // The input shows its change from baseline; outputs show a positive delta.
  expect(screen.getAllByText('+200%').length).toBeGreaterThanOrEqual(2);

  fireEvent.click(screen.getByRole('button', { name: 'Table' }));
  const row = screen.getByRole('row', { name: /Revenue/ });
  const cells = within(row).getAllByRole('cell');
  expect(cells.map((cell) => cell.textContent)).toEqual([
    usd(200),
    usd(600),
    usd(400, true),
    '+200%',
  ]);
  expect(cells[2].getAttribute('data-tone')).toBe('positive');

  fireEvent.click(reset);
  expect(within(row).getAllByRole('cell')[1].textContent).toBe(usd(200));
  expect(reset).toHaveProperty('disabled', true);

  const field = screen.getByRole('textbox', { name: 'Volume' });
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: '1000' } });
  expect(field.getAttribute('aria-invalid')).toBe('true');
  fireEvent.blur(field);
  expect(field).toHaveProperty('value', '100');
  expect(within(row).getAllByRole('cell')[1].textContent).toBe(usd(2000));
});

it('colors deltas by the preferred direction and notes per-metric scales', () => {
  renderChart({
    ...example,
    outputs: [
      ...example.outputs,
      {
        label: 'Units per order',
        unit: 'units',
        better: 'lower',
        formula: ['volume', 2, '*'],
      },
    ],
  });
  fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), {
    target: { value: '20' },
  });
  expect(screen.getByText('Each metric uses its own scale.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Table' }));
  const units = within(
    screen.getByRole('row', { name: /Units per order/ }),
  ).getAllByRole('cell');
  expect(units[2].getAttribute('data-tone')).toBe('negative');
});

it('collapses long assumptions behind an accessible toggle', () => {
  renderChart({ ...example, assumption: 'Held constant. '.repeat(12).trim() });
  const toggle = screen.getByRole('button', { name: 'Show full assumptions' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(toggle.textContent).toBe('Show less');
});

it('mounts trusted controls in an isolated shadow root of the script-disabled report', async () => {
  const encoded = JSON.stringify(example)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
  render(
    <HtmlPreview
      html={`<style>.aw{display:none}</style><div data-agent-chart="${encoded}">Baseline 200 USD</div><div data-agent-chart="{&quot;title&quot;:1}"></div><script>alert(1)</script><input oninput="alert(1)">`}
    />,
  );
  const frame = screen.getByTitle('HTML artifact preview') as HTMLIFrameElement;
  fireEvent.load(frame);
  const document = frame.contentDocument;
  if (!document) throw new Error('Frame missing');
  expect(frame.getAttribute('sandbox')).not.toContain('allow-scripts');
  expect(document.querySelector('script')).toBeNull();
  expect(document.querySelector('[oninput]')).toBeNull();
  expect(document.querySelector('input')).toBeNull();
  expect(document.querySelector('.agent-chart-error')?.textContent).toContain(
    'Interactive chart unavailable',
  );
  const root = document.querySelector('div')?.shadowRoot;
  if (!root) throw new Error('Chart shadow root missing');
  expect(root.querySelector('style')?.textContent).toContain('.aw-slider');
  const control = root.querySelector('input[type="range"]');
  if (!control) throw new Error('Trusted control missing');
  fireEvent.change(control, { target: { value: '30' } });
  expect(
    root.querySelector('[role="img"]')?.getAttribute('aria-label'),
  ).toContain(`scenario ${usd(600)}`);
  // Let the frame's own load event settle inside act.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
