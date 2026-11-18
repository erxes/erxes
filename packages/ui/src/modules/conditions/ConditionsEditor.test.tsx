// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createInstance } from 'i18next';
import { act, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../lib/render-in-dom';
import type { TConditionField, TConditionGroup } from './conditions';
import { ConditionsEditor } from './ConditionsEditor';

// A plugin's own i18next, without core's locales: the editor reads in its English defaults.
const i18n = createInstance();

beforeAll(async () => {
  await i18n
    .use(initReactI18next)
    .init({ lng: 'en', resources: {}, interpolation: { escapeValue: false } });
});

const renderInDom = setupDomRender();

const render = (node: ReactNode) =>
  renderInDom(
    <QueryClientProvider client={new QueryClient()}>
      <I18nextProvider i18n={i18n}>{node}</I18nextProvider>
    </QueryClientProvider>,
  );

const FIELDS: TConditionField[] = [
  { path: 'stage', label: 'Stage', type: 'select', options: [{ value: 's1', label: 'Won' }] },
];

// A value picked from a list, so it opens in a popover (a typed one is edited in the row).
const RULE: TConditionGroup = { match: 'all', rules: [{ path: 'stage', op: 'in', value: ['s1'] }] };

const noop = () => undefined;

/** Clicks the button and returns the name of the dialog it opens. */
const openedName = async (button: Element | null | undefined) => {
  if (!button) throw new Error('no such button');

  await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));

  return vi.waitFor(() => {
    const dialog = document.querySelector('[role="dialog"]');

    if (!dialog) throw new Error('no dialog opened');

    return dialog.getAttribute('aria-label');
  });
};

const button = (container: HTMLElement, name: RegExp) =>
  [...container.querySelectorAll('button')].find((item) =>
    name.test(item.getAttribute('aria-label') ?? item.textContent ?? ''),
  );

describe('the conditions editor’s pickers', () => {
  it('names the field picker "Add filter rule" opens', async () => {
    const container = render(
      <ConditionsEditor value={undefined} onChange={noop} fields={FIELDS} />,
    );

    expect(await openedName(button(container, /^Add filter rule$/))).toBe('Choose a field');
  });

  it.each([
    [/^Field: /, 'Field'],
    [/^Operator: /, 'Operator'],
    [/^Value: /, 'Value'],
  ])('names the popover a rule’s %s button opens', async (name, label) => {
    const container = render(<ConditionsEditor value={RULE} onChange={noop} fields={FIELDS} />);

    expect(await openedName(button(container, name))).toBe(label);
  });
});
