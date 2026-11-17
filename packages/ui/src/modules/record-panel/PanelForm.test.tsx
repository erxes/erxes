// @vitest-environment happy-dom
import { act, useState } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { Input } from '../../components/input';
import { setupDomRender } from '../../lib/render-in-dom';
import { Editor } from '../blocks/components/Editor';
import { PanelFormLayout, PanelFormRow } from './PanelForm';
import { PanelExpansionContext } from './panelExpansion';

const render = setupDomRender();

/** A required editor whose row gets an error when Save is pressed. */
const Checked = () => {
  const [error, setError] = useState<string>();

  return (
    <>
      <PanelFormRow label="Description" required error={error}>
        <Editor onChange={() => undefined} />
      </PanelFormRow>
      <button type="button" onClick={() => setError('Enter a description')}>
        Save
      </button>
    </>
  );
};

const switchRow = (props: { error?: string; hint?: string }) => (
  <PanelFormRow label="Open in a new tab" htmlFor="new-tab" {...props}>
    <input id="new-tab" type="checkbox" />
  </PanelFormRow>
);

/** Whether the row's label is cut at two lines. */
const labelClamped = (container: HTMLElement) =>
  container.querySelector('label span span')?.classList.contains('line-clamp-2');

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

  it('names a text editor by the label, with its placeholder', async () => {
    const container = render(
      <PanelFormRow label="Description" hint="Shown on the card.">
        <Editor onChange={() => undefined} placeholder="Add a description…" />
      </PanelFormRow>,
    );

    const box = await vi.waitFor(() => {
      const found = container.querySelector('[role=textbox]');

      if (!found) throw new Error('no editor yet');

      return found;
    });

    const label = document.getElementById(box.getAttribute('aria-labelledby') ?? '');
    const hint = document.getElementById(box.getAttribute('aria-describedby') ?? '');

    expect(label?.textContent).toBe('Description');
    expect(hint?.textContent).toBe('Shown on the card.');
    expect(box.hasAttribute('aria-label')).toBe(false);

    // BlockNote draws the placeholder from a style it adds to the page.
    const rules = [...document.styleSheets].flatMap((sheet) =>
      [...sheet.cssRules].map((rule) => rule.cssText),
    );

    expect(rules.join('\n')).toContain('Add a description…');
  });

  it('marks a text editor invalid, described by the error, once the row has one', async () => {
    const container = render(<Checked />);

    const box = await vi.waitFor(() => {
      const found = container.querySelector('[role=textbox]');

      if (!found) throw new Error('no editor yet');

      return found;
    });

    expect(box.getAttribute('aria-required')).toBe('true');
    expect(box.hasAttribute('aria-invalid')).toBe(false);

    act(() => container.querySelector('button')?.click());

    expect(box.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(box.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Enter a description',
    );
  });

  it('cuts a long label at two lines in a side panel, and shows it whole on the record page', () => {
    expect(labelClamped(render(switchRow({})))).toBe(true);

    const page = render(
      <PanelExpansionContext.Provider value={{ expanded: true }}>
        {switchRow({})}
      </PanelExpansionContext.Provider>,
    );

    expect(labelClamped(page)).toBe(false);
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
