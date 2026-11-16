// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import type { ContactSearch, ContactSearchQueries, CustomerContact } from '../records/contacts';
import { useContactOptions } from './LookupPicker';

const customer = (id: string, firstName: string): CustomerContact => ({
  id,
  firstName,
  middleName: null,
  lastName: null,
  primaryEmail: null,
  primaryPhone: null,
  avatarUrl: null,
});

const PEOPLE = [customer('c1', 'Anu'), customer('c2', 'Bold'), customer('c3', 'Saraa')];
const asked: ContactSearch[] = [];

const contacts: ContactSearchQueries = {
  customers: (input) => ({
    queryKey: ['customers', input],
    queryFn: async () => {
      asked.push(input);

      if (input.ids) return { data: PEOPLE.filter((person) => input.ids?.includes(person.id)) };

      const term = input.search?.toLowerCase() ?? '';

      return { data: PEOPLE.filter((person) => person.firstName?.toLowerCase().includes(term)) };
    },
  }),
  companies: () => ({ queryKey: ['companies'], queryFn: async () => ({ data: [] }) }),
};

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

const labels = async (picked: string[], search: string, count: number) => {
  let shown: string[] = [];

  const Probe = () => {
    shown = useContactOptions(contacts, 'customer', picked, search).options.map(
      (option) => option.label,
    );

    return null;
  };

  const root = createRoot(document.createElement('div'));
  const client = new QueryClient();

  await act(async () => {
    root.render(createElement(QueryClientProvider, { client }, createElement(Probe)));
  });
  await vi.waitFor(() => expect(shown).toHaveLength(count));
  act(() => root.unmount());

  return shown;
};

describe('useContactOptions', () => {
  it('lists the picked contacts first, then the matches of the search', async () => {
    expect(await labels(['c3'], 'bo', 2)).toEqual(['Saraa', 'Bold']);
    expect(asked).toContainEqual({ ids: ['c3'] });
    expect(asked).toContainEqual({ search: 'bo' });
  });

  it('shows a picked contact once, though the search finds it too', async () => {
    expect(await labels(['c1'], 'a', 2)).toEqual(['Anu', 'Saraa']);
  });
});
