// @vitest-environment happy-dom
// @vitest-environment-options { "settings": { "device": { "prefersReducedMotion": "reduce" } } }
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DisplayMenu,
  ListFilter,
  type TListFilterField,
  useListDisplay,
  useListFilterParams,
  ViewBar,
} from 'erxes-ui';
import { createStore, Provider } from 'jotai';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { I18nextProvider } from 'react-i18next';
import { i18n, i18nReady } from '~/i18n';

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await i18nReady;
});

afterEach(async () => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
  await act(() => i18n.changeLanguage('en'));
});

const render = async (node: ReactNode, searchParams = '') => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  const page = createElement(withNuqsTestingAdapter({ searchParams }), null, node);
  const translated = createElement(I18nextProvider, { i18n }, page);

  await act(async () => {
    root?.render(createElement(QueryClientProvider, { client: new QueryClient() }, translated));
  });

  return container;
};

const query = (filter: unknown, search?: string) =>
  `?advanced=${encodeURIComponent(JSON.stringify(filter))}${search ? `&searchValue=${search}` : ''}`;

const Params = () => createElement('output', null, JSON.stringify(useListFilterParams()));

const Shown = ({ list }: { list: string }) => createElement('p', null, useListDisplay(list)[0]);

const FIELDS: TListFilterField[] = [
  { path: 'subject.name', label: 'Name', type: 'text' },
  {
    path: 'subject.stageId',
    label: 'Stage',
    type: 'select',
    options: [{ value: 's1', label: 'Won' }],
  },
];

const WON = { match: 'all', rules: [{ path: 'subject.stageId', op: 'in', value: ['s1'] }] };

describe('a plugin list’s bar', () => {
  it('gives the list’s API the filter and search in the address; no conditions is no filter', async () => {
    const container = await render(createElement(Params), query(WON, 'acme'));

    expect(JSON.parse(container.textContent ?? '')).toEqual({
      filter: JSON.stringify(WON),
      search: 'acme',
    });

    act(() => root?.unmount());

    const empty = await render(createElement(Params), query({ match: 'all', rules: [] }));

    expect(JSON.parse(empty.textContent ?? '')).toEqual({});
  });

  it('shows its one view as "All …" and its filter on the right', async () => {
    const container = await render(
      createElement(ViewBar, { allLabel: 'All deals' }, createElement('span', null, 'filter')),
    );

    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe('All deals');
    expect(container.textContent).toContain('filter');
  });

  it('draws core’s filter bar on the plugin’s fields, a choice by its label, in web’s language', async () => {
    const container = await render(
      createElement(ListFilter, { id: 'deals', fields: FIELDS, totalCount: 3 }),
      query(WON),
    );

    // No host registers it: erxes-ui's bar loads on first render.
    await vi.waitFor(() =>
      expect(container.querySelector('button[aria-keyshortcuts="F"]')).not.toBeNull(),
    );
    expect(container.textContent).toContain('Stage');
    expect(container.textContent).toContain('Won');
    expect(container.textContent).toContain('3 records');

    act(() => root?.unmount());
    await act(() => i18n.changeLanguage('mn'));

    const mongolian = await render(
      createElement(ListFilter, { id: 'deals', fields: FIELDS, totalCount: 3 }),
      query(WON),
    );

    await vi.waitFor(() =>
      expect(
        mongolian.querySelector('button[aria-keyshortcuts="F"]')?.getAttribute('aria-label'),
      ).toBe('Шүүлтүүр'),
    );
    expect(mongolian.textContent).toContain('3 бүртгэл');
  });

  it('switches between table and board under Display, remembered per list', async () => {
    const container = await render([
      createElement(DisplayMenu, { key: 'menu', list: 'deals' }),
      createElement(Shown, { key: 'deals', list: 'deals' }),
      createElement(Shown, { key: 'tasks', list: 'tasks' }),
    ]);

    expect(container.querySelector('p')?.textContent).toBe('table');

    await act(async () => container.querySelector('button')?.click());
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
        .find((button) => button.textContent === 'Board')
        ?.click(),
    );

    expect([...container.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'board',
      'table',
    ]);

    // A new page load (a fresh store) reads the choice back from the browser.
    act(() => root?.unmount());

    const reloaded = await render(
      createElement(Provider, { store: createStore() }, createElement(Shown, { list: 'deals' })),
    );

    expect(reloaded.textContent).toBe('board');
  });

  it('offers the displays a list names, showing the first until one is picked', async () => {
    const displays = ['list', 'board', 'table'] as const;
    const ShownOf = () => createElement('p', null, useListDisplay('tasks', displays)[0]);

    const container = await render([
      createElement(DisplayMenu, { key: 'menu', list: 'tasks', displays }),
      createElement(ShownOf, { key: 'tasks' }),
    ]);

    expect(container.querySelector('p')?.textContent).toBe('list');

    await act(async () => container.querySelector('button')?.click());

    const options = [...document.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')];

    expect(options.map((button) => button.textContent)).toEqual(['List', 'Board', 'Table']);

    await act(async () => options.at(-1)?.click());

    expect(container.querySelector('p')?.textContent).toBe('table');
  });
});
