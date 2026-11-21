import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createInstance } from 'i18next';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { act, createElement, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { setupDomRender } from './render-in-dom';

const english = createInstance();

void english.use(initReactI18next).init({
  lng: 'en',
  resources: {},
  interpolation: { escapeValue: false },
  initAsync: false,
});

/**
 * Renders a component as a page would have it, for a `.test.tsx` under happy-dom: at an
 * address (`searchParams`, with `onUrlUpdate` told of each change), in English, with its own
 * query client and jotai store.
 */
export const setupPageRender = () => {
  const render = setupDomRender();

  return (node: ReactNode, searchParams = '', onUrlUpdate?: OnUrlUpdateFunction) =>
    render(
      createElement(
        withNuqsTestingAdapter({ searchParams, onUrlUpdate }),
        null,
        <QueryClientProvider client={new QueryClient()}>
          <I18nextProvider i18n={english}>
            <JotaiProvider store={createStore()}>{node}</JotaiProvider>
          </I18nextProvider>
        </QueryClientProvider>,
      ),
    );
};

/** Waits, a few seconds at most, until a part that loads on first use has drawn something. */
export const loaded = async (shown: () => boolean, tries = 100): Promise<void> => {
  if (shown() || tries === 0) return;

  await settle(30);

  return loaded(shown, tries - 1);
};

/** Lets popovers open, queries answer and the address update, which take a moment. */
export const settle = (ms = 60) =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      }),
  );
