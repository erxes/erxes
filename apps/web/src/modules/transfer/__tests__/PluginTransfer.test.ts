// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { PluginExport, PluginImport } from '../PluginTransfer';

const TYPES = [
  {
    recordType: 'accounting:transaction',
    label: 'Transactions',
    plugin: 'accounting',
    canImport: true,
    canExport: true,
  },
  {
    recordType: 'accounting:account',
    label: 'Accounts',
    plugin: 'accounting',
    canImport: false,
    canExport: false,
  },
];

const COLUMNS = [
  {
    key: 'number',
    label: 'Number',
    group: 'field',
    importable: true,
    exportable: true,
    default: true,
  },
  { key: 'date', label: 'Date', group: 'field', importable: true, exportable: true, default: true },
];

const page = {
  data: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
  totalCount: 0,
};

/** What the buttons sent core to export. */
const exportsAsked: unknown[] = [];

const answer = async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = input instanceof Request ? input : new Request(String(input), init);
  const { pathname } = new URL(request.url);

  if (pathname === '/core/v1/transfer/types') return Response.json({ data: TYPES });

  if (pathname === '/core/v1/transfer/columns') return Response.json({ data: COLUMNS });

  if (pathname === '/core/v1/exports' && request.method === 'POST') {
    exportsAsked.push(await request.json());

    return Response.json(
      {
        id: 'x1',
        recordType: 'accounting:transaction',
        format: 'xlsx',
        columns: ['number', 'date'],
        status: 'running',
        rowCount: null,
        fileId: null,
        error: null,
        createdBy: 'u1',
        createdAt: new Date().toISOString(),
        finishedAt: null,
      },
      { status: 202 },
    );
  }

  if (pathname === '/core/v1/exports' || pathname === '/core/v1/imports')
    return Response.json(page);

  return Response.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 });
};

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', answer);
  await i18nReady;
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 80);
      }),
  );

const render = async (node: ReactNode) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(I18nextProvider, { i18n }, createElement(MemoryRouter, null, node)),
      ),
    );
  });
  await settle();

  return container;
};

const button = (text: string) =>
  [...document.querySelectorAll('button')].find((item) => item.textContent?.trim() === text);

/** Opens Export and starts it with the columns it offers: the dialog's last button. */
const exportAll = async () => {
  act(() => button('Export')?.click());
  await settle();
  act(() => {
    [...document.querySelectorAll<HTMLElement>('[role="dialog"] button')].at(-1)?.click();
  });
  await settle();
};

describe('plugin Import and Export', () => {
  it('show only for record types the member may import or export', async () => {
    const shown = await render([
      createElement(PluginImport, { key: 'i', recordType: 'accounting:transaction' }),
      createElement(PluginExport, { key: 'e', recordType: 'accounting:transaction' }),
      createElement(PluginImport, { key: 'a', recordType: 'accounting:account' }),
    ]);

    // Import, then Export and its recent-exports chevron; nothing for accounts.
    expect([...shown.querySelectorAll('button')].map((item) => item.textContent?.trim())).toEqual([
      'Import',
      'Export',
      '',
    ]);
  });

  it('opens 3.x’s import popover, with Import now and the history', async () => {
    await render(
      createElement(PluginImport, {
        recordType: 'accounting:transaction',
        title: 'Import transactions',
      }),
    );

    act(() => button('Import')?.click());
    await settle();

    expect(document.body.textContent).toContain('Import transactions');
    expect(button('Import now')).toBeDefined();
    expect(document.body.textContent).toContain('No imports running');
  });

  it('exports the selected rows, else the list’s own filter', async () => {
    await render(
      createElement(PluginExport, {
        recordType: 'accounting:transaction',
        getFilters: () => ({ journal: 'main', status: ['draft'] }),
      }),
    );

    await exportAll();

    expect(exportsAsked.at(-1)).toMatchObject({
      recordType: 'accounting:transaction',
      columns: ['number', 'date'],
      query: { params: { journal: 'main', status: ['draft'] } },
    });

    act(() => root?.unmount());
    document.body.innerHTML = '';

    await render(
      createElement(PluginExport, { recordType: 'accounting:transaction', ids: ['t1', 't2'] }),
    );

    await exportAll();

    expect(exportsAsked.at(-1)).toMatchObject({ query: { ids: ['t1', 't2'] } });
  });
});
