import type { AssistantRecord } from '@erxes/core-contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vite-plus/test';
import { orpc } from '~/lib/api';
import { MessageText } from '../MessageText';
import { Reply } from '../Reply';

const render = (element: ReactElement, references: Record<string, AssistantRecord> = {}) => {
  const client = new QueryClient();

  for (const [handle, record] of Object.entries(references)) {
    client.setQueryData(orpc.assistant.reference.queryKey({ input: { handle } }), record);
  }

  return renderToStaticMarkup(
    createElement(QueryClientProvider, { client }, createElement(MemoryRouter, null, element)),
  );
};

const reply = (text: string) => createElement(Reply, { text, streaming: false });

const NOMIN: AssistantRecord = {
  available: true,
  type: 'customer',
  id: 'c-nomin',
  label: 'Nomin Group',
};

describe('record references in a reply', () => {
  it("shows a reference as a link to the record's page, with its current name", () => {
    const html = render(reply('The top customer is [[ref:h-nomin]].'), { 'h-nomin': NOMIN });

    expect(html).toContain('href="/contacts/customers/c-nomin"');
    expect(html).toContain('Nomin Group');
    expect(html).not.toContain('[[ref:');
  });

  it('shows a reference inside a table cell as the same link', () => {
    const html = render(reply('| # | Customer |\n| - | --- |\n| 1 | [[ref:h-nomin]] |'), {
      'h-nomin': NOMIN,
    });

    expect(html).toMatch(/<td[^>]*>.*href="\/contacts\/customers\/c-nomin".*<\/td>/s);
  });

  it('shows a handle that resolves to nothing as unavailable, with no link', () => {
    const html = render(reply('See [[ref:h-forged]].'), { 'h-forged': { available: false } });

    expect(html).toContain('Unavailable');
    expect(html).not.toContain('<a');
  });

  it('links each kind of record to its own page', () => {
    const html = render(reply('[[ref:a]] [[ref:b]] [[ref:c]] [[ref:d]]'), {
      a: { available: true, type: 'company', id: 'co1', label: 'Altai Foods' },
      b: { available: true, type: 'member', id: 'm1', label: 'Bat Erdene' },
      c: { available: true, type: 'product', id: 'p1', label: 'Cashmere scarf' },
      d: { available: true, type: 'automation', id: 'au1', label: 'Welcome flow' },
    });

    expect(html).toContain('href="/contacts/companies/co1"');
    expect(html).toContain('href="/settings/team-members/m1"');
    expect(html).toContain('href="/products/p1"');
    expect(html).toContain('href="/automations/au1"');
  });
});

describe("mentions in the member's message", () => {
  it('shows each mention as a link to the record it names', () => {
    const html = render(
      createElement(MessageText, {
        text: 'Compare @Nomin Group with @Altai Foods please',
        mentions: [
          { type: 'customer', id: 'c-nomin', label: 'Nomin Group' },
          { type: 'company', id: 'co1', label: 'Altai Foods' },
        ],
      }),
    );

    expect(html).toContain('href="/contacts/customers/c-nomin"');
    expect(html).toContain('href="/contacts/companies/co1"');
    expect(html).toContain('Compare ');
    expect(html).toContain(' please');
    expect(html).not.toContain('@Nomin Group');
  });
});
