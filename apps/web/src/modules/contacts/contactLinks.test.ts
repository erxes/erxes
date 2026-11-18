// @vitest-environment happy-dom
import { contactQueries } from '@erxes/core-contract/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContactLink } from 'erxes-ui';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';

const customer = (id: string, firstName: string) => ({
  id,
  firstName,
  middleName: null,
  lastName: null,
  primaryEmail: null,
  primaryPhone: null,
  avatarUrl: null,
});

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });

/** Core as far as the links read it: `c42` was merged into `c7`, so only `get` finds it. */
const core = vi.fn<(input: Request | string | URL) => Promise<Response>>(async (input) => {
  const url = new URL(input instanceof Request ? input.url : input);
  const ids = url.searchParams.get('ids')?.split(',') ?? [];

  if (url.pathname === '/core/v1/customers') {
    const rows = ids.filter((id) => id !== 'c42').map((id) => customer(id, `Customer ${id}`));

    return json({ data: rows, pageInfo: { hasNextPage: false }, totalCount: rows.length });
  }

  if (url.pathname === '/core/v1/customers/c42') return json(customer('c7', 'Customer c7'));

  return new Response(null, { status: 404 });
});

let root: Root | undefined;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal('fetch', core);
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

describe('contactQueries', () => {
  it('reads the customers of a hundred links in one request, and a merged one on its own', async () => {
    const container = document.createElement('div');
    const crashes: unknown[] = [];

    document.body.append(container);
    root = createRoot(container, { onUncaughtError: (error) => crashes.push(error) });

    const links = Array.from({ length: 100 }, (_, index) =>
      createElement(ContactLink, {
        key: index,
        contentType: 'core:customer',
        contentId: `c${index}`,
        contacts: contactQueries,
      }),
    );

    await act(async () => {
      root?.render(createElement(QueryClientProvider, { client: new QueryClient() }, links));
    });

    await vi.waitFor(() => {
      expect(crashes).toEqual([]);
      expect(container.querySelectorAll('[title^="Customer"]')).toHaveLength(100);
    });

    const paths = core.mock.calls.map(([input]) =>
      new URL(input instanceof Request ? input.url : input).pathname.replace('/core/v1', ''),
    );

    expect(paths).toEqual(['/customers', '/customers/c42']);
    expect(container.querySelector('[title="Customer c99"]')).not.toBeNull();
    // The merged id shows the customer it became.
    expect(container.querySelectorAll('[title="Customer c7"]')).toHaveLength(2);
  });
});
