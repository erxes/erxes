// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type OnUrlUpdateFunction, withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { act, createElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../../lib/render-in-dom';
import { ReportPageContainer } from './ReportPageContainer';
import { ReportTable } from './ReportTable';

const render = setupDomRender();

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {},
  interpolation: { escapeValue: false },
  initAsync: false,
});

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      }),
  );

const page = (searchParams: string, onUrlUpdate?: OnUrlUpdateFunction, onExport?: () => void) =>
  render(
    createElement(
      withNuqsTestingAdapter({ searchParams, onUrlUpdate }),
      null,
      <I18nextProvider i18n={i18n}>
        <JotaiProvider store={createStore()}>
          <ReportPageContainer onExport={onExport}>
            <ReportTable>
              <ReportTable.Body>
                <ReportTable.Row>
                  <ReportTable.Cell>Cash</ReportTable.Cell>
                </ReportTable.Row>
              </ReportTable.Body>
            </ReportTable>
          </ReportPageContainer>
        </JotaiProvider>
      </I18nextProvider>,
    ),
  );

const button = (name: string) =>
  [...document.querySelectorAll('button')].find(
    (item) => item.getAttribute('aria-label') === name || item.textContent === name,
  );

const size = () =>
  document.querySelector<HTMLInputElement>('input[aria-label="Print size"]')?.value;

describe('ReportPageContainer', () => {
  it('zooms the sheet in steps of 10%, between 60% and 160%', () => {
    page('?inPreview=true');

    expect(size()).toBe('100');

    for (let step = 0; step < 8; step += 1) act(() => button('Larger')?.click());
    expect(size()).toBe('160');

    for (let step = 0; step < 12; step += 1) act(() => button('Smaller')?.click());
    expect(size()).toBe('60');
  });

  it('shows the sidebar from the start, and hides it on the toggle', async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();

    page('', onUrlUpdate);
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?inPreview=true');

    act(() => button('hide sidebar')?.click());
    await settle();

    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe('?inPreview=false');
  });

  it('offers Excel only with an export', () => {
    const onExport = vi.fn<() => void>();

    page('?inPreview=true');
    expect(button('Export to excel')).toBeUndefined();

    document.body.innerHTML = '';
    page('?inPreview=true', undefined, onExport);
    act(() => button('Export to excel')?.click());
    expect(onExport).toHaveBeenCalled();
  });
});
