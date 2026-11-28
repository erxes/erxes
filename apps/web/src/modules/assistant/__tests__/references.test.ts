// @vitest-environment happy-dom
import type { AssistantRecord } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordOpenerProvider, type RecordRef } from 'erxes-ui';
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { orpc } from '@erxes/core-contract/client';
import { MessageText } from '../MessageText';
import { Markdown } from '../Markdown';

let root: Root | null = null;

const ignore = () => undefined;

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const render = (element: ReactElement, references: Record<string, AssistantRecord> = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  const opened: RecordRef[] = [];

  for (const [handle, record] of Object.entries(references)) {
    client.setQueryData(orpc.assistant.reference.queryKey({ input: { handle } }), record);
  }

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  const tree = createElement(
    QueryClientProvider,
    { client },
    createElement(
      RecordOpenerProvider,
      {
        open: (record: RecordRef) => opened.push(record),
        openNew: ignore,
        current: null,
        dismiss: ignore,
      },
      createElement(MemoryRouter, null, element),
    ),
  );

  act(() => root?.render(tree));

  const chip = (name: string) => {
    const found = container.querySelector(`[title="${name}"]`);

    if (!(found instanceof HTMLElement)) throw new Error(`no chip named ${name}`);

    return found;
  };

  const click = (name: string) => act(() => chip(name).click());

  return { container, opened, chip, click };
};

const reply = (text: string) => createElement(Markdown, { text, streaming: false });

const NOMIN: AssistantRecord = {
  available: true,
  type: 'customer',
  id: 'c-nomin',
  label: 'Nomin Group',
};

describe('record references in a reply', () => {
  it('shows a reference by its current name and opens it in the side panel', () => {
    const view = render(reply('The top customer is [[ref:h-nomin]].'), { 'h-nomin': NOMIN });

    expect(view.container.textContent).toContain('Nomin Group');
    expect(view.container.textContent).not.toContain('[[ref:');

    view.click('Nomin Group');

    expect(view.opened).toEqual([{ contentType: 'core:customer', contentId: 'c-nomin' }]);
  });

  it('shows a reference inside a table cell as the same chip', () => {
    const view = render(reply('| # | Customer |\n| - | --- |\n| 1 | [[ref:h-nomin]] |'), {
      'h-nomin': NOMIN,
    });

    expect(view.chip('Nomin Group').closest('td')).not.toBeNull();
  });

  it('shows a handle that resolves to nothing as unavailable, opening nothing', () => {
    const view = render(reply('See [[ref:h-forged]].'), { 'h-forged': { available: false } });

    expect(view.container.textContent).toContain('Unavailable');
    expect(view.container.querySelector('a, button')).toBeNull();
  });

  it('opens each kind of record the side panel shows there, and an automation on its page', () => {
    const view = render(reply('[[ref:a]] [[ref:b]] [[ref:c]] [[ref:d]]'), {
      a: { available: true, type: 'company', id: 'co1', label: 'Altai Foods' },
      b: { available: true, type: 'member', id: 'm1', label: 'Bat Erdene' },
      c: { available: true, type: 'product', id: 'p1', label: 'Cashmere scarf' },
      d: { available: true, type: 'automation', id: 'au1', label: 'Welcome flow' },
    });

    view.click('Altai Foods');
    view.click('Bat Erdene');
    view.click('Cashmere scarf');

    expect(view.opened).toEqual([
      { contentType: 'core:company', contentId: 'co1' },
      { contentType: 'core:user', contentId: 'm1' },
      { contentType: 'core:product', contentId: 'p1' },
    ]);
    expect(view.chip('Welcome flow').getAttribute('href')).toBe('/automations/au1');
  });
});

describe("mentions in the member's message", () => {
  it('shows each mention as a chip that opens the record it names', () => {
    const view = render(
      createElement(MessageText, {
        text: 'Compare @Nomin Group with @Altai Foods please',
        mentions: [
          { type: 'customer', id: 'c-nomin', label: 'Nomin Group' },
          { type: 'company', id: 'co1', label: 'Altai Foods' },
        ],
      }),
    );

    expect(view.container.textContent).toContain('Compare ');
    expect(view.container.textContent).toContain(' please');
    expect(view.container.textContent).not.toContain('@Nomin Group');

    view.click('Nomin Group');
    view.click('Altai Foods');

    expect(view.opened).toEqual([
      { contentType: 'core:customer', contentId: 'c-nomin' },
      { contentType: 'core:company', contentId: 'co1' },
    ]);
  });
});
