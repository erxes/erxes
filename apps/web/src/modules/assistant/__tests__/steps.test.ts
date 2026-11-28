// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { RunTrace } from '../RunTrace';
import { transcriptOf } from '../transcriptRows';

let root: Root | null = null;

beforeAll(async () => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  await i18nReady;
  await i18n.loadNamespaces('assistant');
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

interface Call {
  id: string;
  name: string;
  args: Record<string, unknown>;
  output: Record<string, unknown>;
}

const search = (id: string, query: string): Call => ({
  id,
  name: 'searchApi',
  args: { query },
  output: { procedures: [] },
});

const call = (id: string, title: string): Call => ({
  id,
  name: 'callApi',
  args: { procedure: 'customers.update', input: { id: 'c1' }, title },
  output: { ok: true, result: {} },
});

const ASKED_AT = 1_795_554_000_000;

const answeredAt = (index: number, count: number) =>
  ASKED_AT + (index === count - 1 ? 201_000 : 2_000 * (index + 1));

const entriesOf = (calls: Call[]) => [
  {
    id: 1,
    kind: 'assistant.user',
    data: [{ type: 'text', text: 'Tag Anna VIP' }],
    model: [{ role: 'user', content: 'Tag Anna VIP', timestamp: ASKED_AT }],
  },
  {
    id: 2,
    kind: 'pi.assistant',
    model: [
      {
        role: 'assistant',
        content: calls.map(({ id, name, args }) => ({
          type: 'toolCall',
          id,
          name,
          arguments: args,
        })),
        stopReason: 'toolUse',
        timestamp: ASKED_AT + 500,
      },
    ],
  },
  ...calls.map(({ id, name, output }, index) => ({
    id: 100,
    kind: 'pi.toolResult',
    model: [
      {
        role: 'toolResult',
        toolCallId: id,
        toolName: name,
        content: [{ type: 'text', text: JSON.stringify(output) }],
        isError: false,
        timestamp: answeredAt(index, calls.length),
      },
    ],
  })),
];

const render = (calls: Call[], live = false) => {
  const reply = transcriptOf({ entries: entriesOf(calls), docs: {} }).messages.at(-1);

  if (reply?.role !== 'assistant') throw new Error('no reply');

  const row = reply.rows.find((item) => item.kind === 'steps');

  if (row?.kind !== 'steps') throw new Error('no steps row');

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  const { startedAt, endedAt } = reply;
  const steps = createElement(RunTrace, { rows: [row], live, startedAt, endedAt });

  const translated = createElement(I18nextProvider, { i18n }, steps);

  act(() =>
    root?.render(createElement(QueryClientProvider, { client: new QueryClient() }, translated)),
  );

  const button = (name: string) => {
    const found = [...container.querySelectorAll('button')].find((item) =>
      item.textContent?.includes(name),
    );

    if (!found) throw new Error(`no button ${name}`);

    return found;
  };

  return { container, open: (name: string) => act(() => button(name).click()) };
};

describe('the steps a reply took', () => {
  it('reads as plain actions: lookups folded into one row, changes by what they did', () => {
    const view = render([
      search('s1', 'customers.update tags.list'),
      search('s2', '+customers.update'),
      search('s3', 'tags list search'),
      call('c1', 'Find the VIP tag'),
      call('c2', 'Tag Anna Keller VIP'),
    ]);

    view.open('Worked for 3m 21s');

    const text = view.container.textContent;

    expect(text).toContain('Looked up how to do it');
    expect(text).toContain('×3');
    expect(text).toContain('0:08');
    expect(text).toContain('3:21');
    expect(text).toContain('Find the VIP tag');
    expect(text).toContain('Tag Anna Keller VIP');
    expect(text).not.toContain('+customers.update');

    view.open('Looked up how to do it');

    expect(view.container.textContent).toContain('+customers.update');
  });

  it('keeps showing the last step between steps instead of counting them', () => {
    const view = render([search('s1', 'deals'), call('c1', 'List open deals')], true);

    expect(view.container.textContent).toContain('List open deals');
    expect(view.container.textContent).not.toContain('Working on it…');
    expect(view.container.textContent).not.toContain('2 steps');
  });
});
