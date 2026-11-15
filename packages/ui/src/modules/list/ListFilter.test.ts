// @vitest-environment happy-dom
// @vitest-environment-options { "settings": { "device": { "prefersReducedMotion": "reduce" } } }
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createInstance } from 'i18next';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { MemberQueries } from '../pickers/members';
import { DisplayMenu } from './DisplayMenu';
import { ListFilter, type TListFilterField, useListFilterParams } from './ListFilter';

let root: Root | undefined;

// A plugin's own i18next, without core's locales: the bar reads in its English defaults.
const i18n = createInstance();

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await i18n.init({ lng: 'en', resources: {}, interpolation: { escapeValue: false } });
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

// No host app: no web, only the providers a standalone plugin has.
const render = async (node: ReactNode, searchParams: string) => {
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

const address = (filter: unknown) => `?advanced=${encodeURIComponent(JSON.stringify(filter))}`;

const members: MemberQueries = {
  team: {
    queryKey: ['team'],
    queryFn: async () => ({
      data: [
        {
          id: 'u1',
          email: 'bat@example.mn',
          fullName: 'Bat Dorj',
          username: null,
          avatarUrl: null,
          status: 'active',
        },
      ],
    }),
  },
  byIds: (ids) => ({ queryKey: ['members', ids], queryFn: async () => ({ data: [] }) }),
};

const FIELDS: TListFilterField[] = [
  {
    path: 'subject.stageId',
    label: 'Stage',
    type: 'select',
    options: [{ value: 's1', label: 'Won' }],
  },
  { path: 'subject.ownerId', label: 'Owner', type: 'member' },
];

/** The bar loads on first render; its menu button shows once it has. */
const filterButton = (container: HTMLElement) =>
  vi.waitFor(() => {
    const button = container.querySelector('button[aria-keyshortcuts="F"]');

    if (!button) throw new Error('the filter bar has not loaded');

    return button;
  }, 10_000);

const Params = () => createElement('output', null, JSON.stringify(useListFilterParams()));

describe('ListFilter outside erxes', () => {
  it('draws its filter button, a chip per rule in the address and the list’s own controls', async () => {
    const filter = {
      match: 'all',
      rules: [
        { path: 'subject.stageId', op: 'in', value: ['s1'] },
        { path: 'subject.ownerId', op: 'eq', value: 'u1' },
      ],
    };

    const container = await render(
      [
        createElement(
          ListFilter,
          { key: 'bar', id: 'deals', fields: FIELDS, members, totalCount: 1 },
          createElement(DisplayMenu, { list: 'deals' }),
        ),
        createElement(Params, { key: 'params' }),
      ],
      address(filter),
    );

    const button = await filterButton(container);

    expect(button.getAttribute('aria-label')).toBe('Filter');
    expect(button.textContent).toBe('2');
    expect(container.textContent).toContain('Stage');
    expect(container.textContent).toContain('Won');
    expect(container.textContent).toContain('1 record');
    // A member reads by name once `members` answers.
    await vi.waitFor(() => expect(container.textContent).toContain('Bat Dorj'));
    expect(container.querySelector('button[aria-label="Display"]')).not.toBeNull();
    expect(JSON.parse(container.querySelector('output')?.textContent ?? '')).toEqual({
      filter: JSON.stringify(filter),
    });
  });

  it('reads a filter that doesn’t parse as none', async () => {
    const container = await render(
      [
        createElement(ListFilter, { key: 'bar', id: 'deals', fields: FIELDS }),
        createElement(Params, { key: 'params' }),
      ],
      address({ match: 'all', rules: [{ path: 'subject.stageId', op: 'nearly' }] }),
    );

    expect((await filterButton(container)).textContent).toBe('');
    expect(container.textContent).not.toContain('Stage');
    expect(JSON.parse(container.querySelector('output')?.textContent ?? '')).toEqual({});
  });
});
