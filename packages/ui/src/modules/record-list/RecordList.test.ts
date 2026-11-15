// @vitest-environment happy-dom
import { createStore, Provider } from 'jotai';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { RecordList } from './RecordList';
import type { RecordListGroup } from './RecordListRoot';

type Task = { id: string; name: string };

const groups: RecordListGroup<Task>[] = [
  {
    id: 'todo',
    label: 'Todo',
    rows: [
      { id: 't1', name: 'Write the brief' },
      { id: 't2', name: 'Pick a date' },
    ],
  },
  { id: 'doing', label: 'In progress', rows: [{ id: 't3', name: 'Book the room' }] },
  { id: 'done', label: 'Done', rows: [{ id: 't4', name: 'Send invites' }] },
];

let root: Root | undefined;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
  window.localStorage.clear();
});

/** What a command bar beside the list reads: the picked ids. */
const Picked = () => createElement('output', null, RecordList.useSelection().ids.join(','));

const list = (props: { grouped?: boolean } = {}): ReactNode =>
  createElement(
    RecordList.Provider,
    { listId: 'tasks' },
    createElement(RecordList<Task>, {
      groups,
      rowId: (task) => task.id,
      rowLabel: (task) => task.name,
      renderRow: (task) => createElement('span', null, task.name),
      ...props,
    }),
    createElement(Picked),
  );

const picked = (container: HTMLElement) => container.querySelector('output')?.textContent;

/** A fresh store each time, so what stays folded comes from the browser's storage. */
const render = async (node: ReactNode) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(createElement(Provider, { store: createStore() }, node)));

  return container;
};

const byLabel = (container: HTMLElement, label: string) => {
  const found = container.querySelector<HTMLElement>(`[aria-label="${label}"]`);

  if (!found) throw new Error(`nothing labelled ${label}`);

  return found;
};

const click = (element: HTMLElement, init: MouseEventInit = {}) =>
  act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
  });

const rowNames = (container: HTMLElement) =>
  [...container.querySelectorAll('li')].map((row) => row.textContent);

const fold = (container: HTMLElement, label: string) => {
  const header = [...container.querySelectorAll<HTMLElement>('button[aria-expanded]')].find(
    (button) => button.textContent?.includes(label),
  );

  if (!header) throw new Error(`no header ${label}`);

  return click(header);
};

describe('RecordList', () => {
  it('shows each group under a header with its count', async () => {
    const container = await render(list());

    expect(
      [...container.querySelectorAll('section')].map((section) =>
        section.getAttribute('aria-label'),
      ),
    ).toEqual(['Todo', 'In progress', 'Done']);
    expect(container.querySelector('section')?.textContent).toContain('Todo2');
    expect(rowNames(container)).toEqual([
      'Write the brief',
      'Pick a date',
      'Book the room',
      'Send invites',
    ]);
  });

  it('folds a group away and keeps it folded in this browser', async () => {
    const container = await render(list());

    await fold(container, 'In progress');

    expect(rowNames(container)).not.toContain('Book the room');

    act(() => root?.unmount());

    const again = await render(list());

    expect(rowNames(again)).toEqual(['Write the brief', 'Pick a date', 'Send invites']);
  });

  it('picks a range with shift-click, skipping folded groups', async () => {
    const container = await render(list());

    await fold(container, 'In progress');
    await click(byLabel(container, 'Select Write the brief'));
    await click(byLabel(container, 'Select Send invites'), { shiftKey: true });

    expect(picked(container)).toBe('t1,t2,t4');
  });

  it("picks a group's rows from its header, and clears them on a second click", async () => {
    const container = await render(list());
    const all = byLabel(container, 'Select all in Todo');

    await click(all);

    expect(picked(container)).toBe('t1,t2');

    await click(all);

    expect(picked(container)).toBe('');
  });

  it('shows one list with no headers when not grouped', async () => {
    const container = await render(list({ grouped: false }));

    expect(container.querySelector('button[aria-expanded]')).toBeNull();
    expect(rowNames(container)).toHaveLength(4);
  });
});
