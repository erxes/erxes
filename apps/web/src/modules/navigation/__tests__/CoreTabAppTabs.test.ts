// @vitest-environment happy-dom
import { IconAddressBook, IconBolt } from '@tabler/icons-react';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import { CoreTabAppTabs } from '../CoreTabAppTabs';
import type { NavApp } from '../apps';

const TABS: NavApp[] = [
  { id: 'contacts', label: 'Харилцагчид', icon: IconAddressBook, path: 'contacts', kind: 'core' },
  { id: 'automations', label: 'Автоматжуулалт', icon: IconBolt, path: 'automations', kind: 'core' },
];

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

describe('the app tab bar in Mongolian', () => {
  it('tells a screen reader how its tabs move in the member’s language', async () => {
    const container = document.createElement('div');

    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        createElement(CoreTabAppTabs, {
          tabs: TABS,
          activeId: 'contacts',
          onSelect: noop,
          onClose: noop,
          onCloseOthers: noop,
          onCloseToRight: noop,
          onMove: noop,
        }),
      );
    });

    const tab = container.querySelector('[role="tab"]');
    const instructions = document.getElementById(tab?.getAttribute('aria-describedby') ?? '');

    expect(instructions?.textContent).toBe(
      'Байрлалыг нь өөрчлөхдөө хулганаар чирэх, эсвэл мэдрэгч дэлгэц дээр удаан дараад чирнэ үү.',
    );
  });
});
