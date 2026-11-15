// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { PanelFormRow } from './PanelForm';

let root: Root | undefined;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const render = (node: ReactNode) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(node));

  return container;
};

const switchRow = (props: { error?: string; hint?: string }) => (
  <PanelFormRow label="Open in a new tab" htmlFor="new-tab" {...props}>
    <input id="new-tab" type="checkbox" />
  </PanelFormRow>
);

describe('PanelFormRow', () => {
  it('names its control by the label, so a click on the label reaches it', () => {
    const container = render(switchRow({}));
    const box = container.querySelector<HTMLInputElement>('#new-tab');

    act(() => container.querySelector('label')?.click());

    expect(box?.checked).toBe(true);
    expect(container.querySelector('label')?.textContent).toBe('Open in a new tab');
  });

  it('shows its hint under the control, and the error instead once there is one', () => {
    const hinted = render(switchRow({ hint: 'Such as main or footer.' }));

    expect(hinted.textContent).toContain('Such as main or footer.');

    const failed = render(switchRow({ hint: 'Such as main or footer.', error: 'Enter a menu' }));

    expect(failed.querySelector('[role=alert]')?.textContent).toBe('Enter a menu');
    expect(failed.textContent).not.toContain('Such as main or footer.');
  });
});
