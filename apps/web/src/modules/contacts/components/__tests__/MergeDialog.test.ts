// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { MergeDialog } from '../MergeDialog';

let root: Root | undefined;

beforeAll(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await i18nReady;
  await i18n.changeLanguage('mn');
});

afterAll(() => i18n.changeLanguage('en'));

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const noop = () => undefined;

describe('merging customers in Mongolian', () => {
  it('names the dialog, the record kept and its buttons in the member’s language', async () => {
    root = createRoot(document.body.appendChild(document.createElement('div')));
    await act(async () => {
      root?.render(
        createElement(MergeDialog, {
          open: true,
          onOpenChange: noop,
          kind: 'customer',
          onMerge: noop,
          records: [
            { id: 'c1', title: 'Бат', details: [] },
            { id: 'c2', title: 'Сараа', details: [] },
          ],
        }),
      );
    });

    const dialog = document.querySelector('[role="dialog"]');

    expect(dialog?.querySelector('h2')?.textContent).toBe('2 харилцагчийг нийлүүлэх');
    expect(dialog?.querySelector('legend')?.textContent).toBe('Үлдээх харилцагч');
    expect([...(dialog?.querySelectorAll('button') ?? [])].map((b) => b.textContent)).toEqual(
      expect.arrayContaining(['Болих', 'Нийлүүлэх']),
    );
  });
});
