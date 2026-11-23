// @vitest-environment happy-dom
import { createStore, Provider } from 'jotai';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { i18n, i18nReady } from '~/i18n';
import {
  type CatalogGroup,
  type CatalogItem,
  groupOf,
  useCatalogLabels,
  useRecent,
} from '../catalogGroups';

let root: Root | undefined;

beforeAll(async () => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  await i18nReady;
});

afterEach(async () => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  await act(() => i18n.changeLanguage('en'));
});

/** Renders `node` with the app's translations and a fresh store, as the builder does. */
const render = async (node: ReactNode) => {
  act(() => root?.unmount());

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);

  const translated = createElement(I18nextProvider, { i18n }, node);

  await act(async () => {
    root?.render(createElement(Provider, { store: createStore() }, translated));
  });

  return container;
};

const item = (fields: Partial<CatalogItem> & Pick<CatalogItem, 'type' | 'source'>) => ({
  label: fields.type,
  ...fields,
});

const Shown = z.object({
  names: z.array(z.string()),
  counts: z.array(z.string()),
  search: z.string(),
  picker: z.string(),
});

const Labels = ({ kind, groups }: { kind: string; groups: CatalogGroup[] }) => {
  const { groupName, countLabel, searchPlaceholder, pickerLabel } = useCatalogLabels(kind);

  return createElement(
    'output',
    null,
    JSON.stringify({
      names: groups.map(groupName),
      counts: [1, 3].map(countLabel),
      search: searchPlaceholder,
      picker: pickerLabel,
    }),
  );
};

const labelsOf = async (kind: string, groups: CatalogGroup[]) =>
  Shown.parse(
    JSON.parse((await render(createElement(Labels, { kind, groups }))).textContent ?? ''),
  );

describe('the catalog’s words', () => {
  const customers = groupOf(item({ type: 'core.customer.created', source: 'core' }));

  const texts = groupOf(
    item({
      type: 'sms.text.send',
      source: 'core',
      integration: 'sms',
      integrationName: 'Messages',
    }),
  );

  const generalPlugin = groupOf(item({ type: 'general.thing.done', source: 'general' }));

  it('counts and prompts for actions or events', async () => {
    expect(await labelsOf('action', [customers])).toEqual({
      names: ['Customers'],
      counts: ['1 action', '3 actions'],
      search: 'Search actions…',
      picker: 'Choose an action',
    });
    expect(await labelsOf('trigger', [customers])).toEqual({
      names: ['Customers'],
      counts: ['1 event', '3 events'],
      search: 'Search events…',
      picker: 'Choose an event',
    });
  });

  it('translates core’s area names, never an integration’s or a plugin’s own name', async () => {
    await act(() => i18n.changeLanguage('mn'));

    expect(await labelsOf('action', [customers, texts, generalPlugin])).toEqual({
      names: ['Харилцагчид', 'Messages', 'General'],
      counts: ['1 үйлдэл', '3 үйлдэл'],
      search: 'Үйлдэл хайх…',
      picker: 'Үйлдэл сонгох',
    });
    expect(await labelsOf('trigger', [customers])).toEqual({
      names: ['Харилцагчид'],
      counts: ['1 үйл явдал', '3 үйл явдал'],
      search: 'Үйл явдал хайх…',
      picker: 'Үйл явдал сонгох',
    });
  });
});

const Recent = ({ kind, picks }: { kind: string; picks: string[] }) => {
  const { recent, remember } = useRecent(kind);

  return createElement(
    'div',
    null,
    createElement('output', null, recent.join(',')),
    ...picks.map((type) =>
      createElement('button', { key: type, type: 'button', onClick: () => remember(type) }, type),
    ),
  );
};

const recentShown = (container: HTMLElement) =>
  [...container.querySelectorAll('output')].map((output) => output.textContent);

/** An action picker and a trigger picker, side by side. */
const both = () =>
  createElement(
    'div',
    null,
    createElement(Recent, { kind: 'action', picks: ['a', 'b', 'c', 'd', 'e'] }),
    createElement(Recent, { kind: 'trigger', picks: [] }),
  );

describe('recently picked', () => {
  it('keeps the last four picks of a kind, newest first, each once, in this browser', async () => {
    const container = await render(both());

    const pick = (type: string) =>
      act(() => {
        [...container.querySelectorAll('button')]
          .find((button) => button.textContent === type)
          ?.click();
      });

    for (const type of ['a', 'b', 'c', 'd', 'e', 'b', 'e']) pick(type);

    expect(recentShown(container)).toEqual(['e,b,d,c', '']);
    expect(recentShown(await render(both()))).toEqual(['e,b,d,c', '']);
  });
});
