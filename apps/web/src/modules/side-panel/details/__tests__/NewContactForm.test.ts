// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { act, createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  // Nothing is saved: Save stops at the form's own checks.
  vi.stubGlobal('fetch', async () => Response.json({ data: [] }));
  await i18nReady;
  await i18n.changeLanguage('mn');
});

afterAll(() => i18n.changeLanguage('en'));

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

/** Draws the new-contact form and presses Save with nothing filled in. */
const saveEmpty = async (form: ComponentType) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(BrowserRouter, null, createElement(NuqsAdapter, null, createElement(form))),
      ),
    );
  });

  const submit = container.querySelector('button[type="submit"]');

  await act(async () => submit?.dispatchEvent(new MouseEvent('click', { bubbles: true })));

  return container;
};

describe('a new contact’s form in Mongolian', () => {
  it('says what a customer needs in the member’s language', async () => {
    const { CustomerPanelNew } = await import('../CustomerPanelNew');
    const container = await saveEmpty(CustomerPanelNew);

    await vi.waitFor(() =>
      expect(container.textContent).toContain('Нэр, имэйл эсвэл утасны аль нэгийг бөглөнө үү'),
    );
    // The pronoun picker shows its choice in the member's language too.
    expect(container.querySelector('[aria-label="Хүйс"]')?.textContent).toBe('Тодорхойгүй');
  });

  it('says what a company needs in the member’s language', async () => {
    const { CompanyPanelNew } = await import('../CompanyPanelNew');
    const container = await saveEmpty(CompanyPanelNew);

    await vi.waitFor(() =>
      expect(container.textContent).toContain('Байгууллагын нэрийг оруулна уу'),
    );
  });
});
