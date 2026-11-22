// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { catalogQuery } from '../../automationQueries';
import { type EventDataSource, EventDataHint } from '../EventDataHint';

let root: Root | null = null;

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const textFor = (event: EventDataSource, subject: 'customer' | null) => {
  const client = new QueryClient();
  const container = document.createElement('div');

  client.setQueryData(catalogQuery().queryKey, { triggers: [], actions: [], apps: [] });
  document.body.append(container);

  const mounted = createRoot(container);

  root = mounted;
  act(() =>
    mounted.render(
      createElement(
        QueryClientProvider,
        { client },
        createElement(EventDataHint, { event, subject }),
      ),
    ),
  );

  return container.textContent;
};

describe('EventDataHint', () => {
  it('says how to get a plugin event’s data while none has arrived, and that it shows up by itself', () => {
    const text = textFor({ label: 'Chat received', source: 'chat', seen: false }, 'customer');

    expect(text).toContain('No data from this event yet');
    expect(text).toContain('Make it happen once');
    expect(text).toContain('shows up here by itself');
    expect(text).toContain('You can already use the customer’s details.');
    expect(document.querySelector('button')).toBeNull();
  });

  it('does not ask the member to wait for an event that arrived with nothing, or for core’s', () => {
    const arrived = textFor({ label: 'Office opened', source: 'hr', seen: true }, null);

    expect(arrived).toContain('carries no data of its own.');
    expect(arrived).not.toContain('No data from this event yet');

    act(() => root?.unmount());

    expect(textFor({ label: 'Tag created', source: 'core' }, null)).not.toContain(
      'No data from this event yet',
    );
  });
});
