/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { WhatIfChart } from '../WhatIfChart';
import { evaluateChartFormula, parseWhatIfChart } from '../whatIfChartModel';
import { HtmlPreview } from '../HtmlPreview';

jest.mock('erxes-ui', () => ({ Input: 'input', Button: 'button' }));
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

it('recalculates bars and values when a factor changes and resets the baseline', () => {
  const spec = parseWhatIfChart(JSON.stringify(example));
  if (!spec) throw new Error('Invalid fixture');
  render(<WhatIfChart spec={spec} />);
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
    'scenario 200 USD',
  );
  fireEvent.change(screen.getByLabelText('Volume'), {
    target: { value: '30' },
  });
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
    'baseline 200 USD, scenario 600 USD',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reset scenario' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain(
    'scenario 200 USD',
  );
  fireEvent.change(screen.getByLabelText('Volume'), {
    target: { value: '1000' },
  });
  expect(
    screen.getByRole('spinbutton', { name: 'Volume' }).getAttribute('value'),
  ).toBe('100');
});

it('mounts trusted controls in the script-disabled report and rejects executable payloads', () => {
  const encoded = JSON.stringify(example)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
  render(
    <HtmlPreview
      html={`<div data-agent-chart="${encoded}">Baseline 200 USD</div><script>alert(1)</script><input oninput="alert(1)">`}
    />,
  );
  const frame = screen.getByTitle('HTML artifact preview') as HTMLIFrameElement;
  fireEvent.load(frame);
  const document = frame.contentDocument;
  if (!document) throw new Error('Frame missing');
  expect(frame.getAttribute('sandbox')).not.toContain('allow-scripts');
  expect(document.querySelector('script')).toBeNull();
  expect(document.querySelector('[oninput]')).toBeNull();
  const control = document.querySelector('input');
  if (!control) throw new Error('Trusted control missing');
  fireEvent.change(control, { target: { value: '30' } });
  expect(document.querySelector('svg')?.getAttribute('aria-label')).toContain(
    'scenario 600 USD',
  );
});
