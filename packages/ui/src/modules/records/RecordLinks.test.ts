// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { ContactLink } from './ContactLink';
import type { MemberQueries } from '../pickers/members';
import type { ContactQueries } from './contacts';
import { MemberLink } from './MemberLink';
import { type RecordRef, RecordOpenerProvider } from './openRecord';

const contacts: ContactQueries = {
  customer: (id) => ({
    queryKey: ['customer', id],
    queryFn: async () => ({
      id,
      firstName: 'Bat',
      middleName: null,
      lastName: 'Dorj',
      primaryEmail: 'bat@example.mn',
      primaryPhone: null,
      avatarUrl: null,
    }),
  }),
  company: (id) => ({
    queryKey: ['company', id],
    queryFn: async () => {
      if (id === 'missing') throw new Error('Company not found');

      return {
        id,
        primaryName: null,
        primaryEmail: null,
        primaryPhone: '99112233',
        avatarUrl: null,
      };
    },
    retry: false,
  }),
};

let root: Root | undefined;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const render = async (node: ReactNode) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  const client = new QueryClient();

  await act(async () => {
    root?.render(createElement(QueryClientProvider, { client }, node));
  });
  await vi.waitFor(() => expect(container.querySelector('.animate-pulse')).toBeNull());

  return container;
};

const link = (contentType: 'core:customer' | 'core:company', contentId: string) =>
  createElement(ContactLink, { contentType, contentId, contacts });

/** Inside erxes: web provides how records open. */
const inHost = (open: (record: RecordRef) => void, children: ReactNode) =>
  createElement(RecordOpenerProvider, { open }, children);

describe('ContactLink', () => {
  it('opens the customer through the host, named by its full name', async () => {
    const open = vi.fn<(record: RecordRef) => void>();
    const container = await render(inHost(open, link('core:customer', 'c1')));

    const button = container.querySelector('button');

    expect(button?.textContent).toContain('Bat Dorj');

    await act(async () => button?.click());

    expect(open).toHaveBeenCalledWith({ contentType: 'core:customer', contentId: 'c1' });
  });

  it('is only the name outside erxes', async () => {
    const container = await render(link('core:company', 'k1'));

    expect(container.querySelector('button')).toBeNull();
    expect(container.textContent).toContain('99112233');
  });

  it('says why a record can not be read', async () => {
    const container = await render(inHost(() => undefined, link('core:company', 'missing')));

    expect(container.querySelector('button')?.textContent).toContain('Company not found');
  });
});

const members: MemberQueries = {
  team: {
    queryKey: ['team'],
    queryFn: async () => ({
      data: [
        {
          id: 'u1',
          email: 'saraa@acme.mn',
          fullName: 'Saraa Bat',
          username: null,
          avatarUrl: null,
          status: 'active',
        },
      ],
    }),
  },
  byIds: (ids) => ({ queryKey: ['members', ids], queryFn: async () => ({ data: [] }) }),
};

describe('MemberLink', () => {
  it('opens the member through the host as core:user', async () => {
    const open = vi.fn<(record: RecordRef) => void>();

    const container = await render(
      inHost(open, createElement(MemberLink, { memberId: 'u1', members })),
    );

    const button = container.querySelector('button');

    expect(button?.textContent).toContain('Saraa Bat');

    await act(async () => button?.click());

    expect(open).toHaveBeenCalledWith({ contentType: 'core:user', contentId: 'u1' });
  });
});
