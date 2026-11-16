// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it } from 'vite-plus/test';
import { Input } from '../../components/input';
import { setupDomRender } from '../../lib/render-in-dom';
import { PanelFormLayout, PanelFormRow } from './PanelForm';

const render = setupDomRender();

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

  it('names its input by the label and marks it invalid and required, described by the error', () => {
    const container = render(
      <PanelFormRow label="Name" required error="Enter a name">
        <Input />
      </PanelFormRow>,
    );

    const input = container.querySelector('input');
    const label = document.getElementById(input?.getAttribute('aria-labelledby') ?? '');
    const message = document.getElementById(input?.getAttribute('aria-describedby') ?? '');

    expect(label?.textContent).toBe('Name *');
    expect(message?.textContent).toBe('Enter a name');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-required')).toBe('true');
  });
});

const layout = (onCancel: () => void) => (
  <form>
    <PanelFormLayout onCancel={onCancel}>
      <PanelFormRow label="Picture">
        <button type="button">Upload</button>
      </PanelFormRow>
      <PanelFormRow label="Name">
        <Input />
      </PanelFormRow>
    </PanelFormLayout>
  </form>
);

describe('PanelFormLayout', () => {
  it('puts the cursor in the first field it can type into', () => {
    const container = render(layout(() => undefined));

    expect(document.activeElement).toBe(container.querySelector('input'));
  });

  it('leaves on Escape while nothing was typed', () => {
    let cancelled = 0;
    const container = render(layout(() => (cancelled += 1)));
    const input = container.querySelector('input');

    act(() => {
      input?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }),
      );
    });

    expect(cancelled).toBe(1);
  });
});
