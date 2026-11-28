// @vitest-environment happy-dom
import { act, useState } from 'react';
import { expect, it } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Select } from './select';

const render = setupDomRender();

/** A form field whose value arrives after the first render, as a form reset gives it. */
const LateValue = () => {
  const [status, setStatus] = useState<string | undefined>();

  return (
    <>
      <button type="button" onClick={() => setStatus('complete')}>
        fill
      </button>
      <button type="button" onClick={() => setStatus(undefined)}>
        clear
      </button>
      <Select value={status} onValueChange={setStatus}>
        <Select.Trigger>
          <Select.Value placeholder="Pick a status" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="complete">Completed</Select.Item>
          <Select.Item value="draft">Draft</Select.Item>
        </Select.Content>
      </Select>
    </>
  );
};

it('shows a value that arrives after the first render, and its removal', () => {
  const container = render(<LateValue />);
  const trigger = () => container.querySelector('[role="combobox"]');

  const click = (name: string) =>
    act(() =>
      [...container.querySelectorAll('button')].find((b) => b.textContent === name)?.click(),
    );

  expect(trigger()?.textContent).toBe('Pick a status');

  click('fill');
  expect(trigger()?.textContent).toBe('Completed');

  click('clear');
  expect(trigger()?.textContent).toBe('Pick a status');
});
