// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { MergeDialog } from '../MergeDialog';

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await i18nReady;
});

afterAll(() => i18n.changeLanguage('en'));

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const noop = () => undefined;

const people = [
  { id: 'c1', firstName: 'Бат', lastName: 'Дорж', position: null },
  { id: 'c2', firstName: 'Батболд', lastName: 'Сүх', position: 'CEO' },
];

type Person = (typeof people)[number];

type PersonField = 'firstName' | 'lastName' | 'position';

type OnMerge = (keepId: string, fields: Partial<Record<PersonField, string>>) => void;

const render = async (onMerge: OnMerge) => {
  root = createRoot(document.body.appendChild(document.createElement('div')));
  await act(async () => {
    root?.render(
      createElement(MergeDialog<Person, PersonField>, {
        open: true,
        onOpenChange: noop,
        kind: 'customer',
        onMerge,
        records: people,
        head: (row) => ({ title: row.firstName, details: [] }),
        fields: [
          { key: 'firstName', label: 'First name' },
          { key: 'lastName', label: 'Last name' },
          { key: 'position', label: 'Position' },
        ],
      }),
    );
  });

  return document.querySelector('[role="dialog"]');
};

const button = (dialog: Element | null, text: string) =>
  [...(dialog?.querySelectorAll('button') ?? [])].find((b) => b.textContent === text);

describe('merging customers', () => {
  it('names the dialog, the record kept and its buttons in the member’s language', async () => {
    await i18n.changeLanguage('mn');

    const dialog = await render(noop);

    expect(dialog?.querySelector('h2')?.textContent).toBe('2 харилцагчийг нийлүүлэх');
    expect(dialog?.querySelector('legend')?.textContent).toBe('Үлдээх харилцагч');
    expect(button(dialog, 'Болих')).toBeDefined();
    expect(button(dialog, 'Нийлүүлэх')).toBeDefined();
  });

  it('takes each field from the record picked for it', async () => {
    await i18n.changeLanguage('en');

    const onMerge = vi.fn<OnMerge>();
    const dialog = await render(onMerge);
    const lastNames = dialog?.querySelectorAll<HTMLInputElement>('input[type="radio"]');

    const sukh = [...(lastNames ?? [])].find(
      (input) => input.closest('label')?.textContent === 'Сүх',
    );

    await act(async () => sukh?.click());
    await act(async () => button(dialog, 'Merge')?.click());

    expect(onMerge).toHaveBeenCalledWith('c1', {
      firstName: 'c1',
      lastName: 'c2',
      position: 'c2',
    });
  });
});
