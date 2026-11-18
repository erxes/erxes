// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { Badge } from '../components/badge';
import { Breadcrumb } from '../components/breadcrumb';
import { MultipleSelector } from '../components/multiselect';
import { setupDomRender } from '../lib/render-in-dom';
import { AppLayout } from '../modules/layout/components/AppLayout';
import { useSortAccessibility } from './use-sort-accessibility';

// The host's Mongolian locale for these controls, as web ships it.
const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'mn',
    resources: {
      mn: {
        common: {
          navigation: { 'collapse-sidebar': 'Хажуугийн самбарыг хураах' },
        },
        ui: {
          badge: { remove: 'Хасах' },
          breadcrumb: { label: 'Замын мөр' },
          multiselect: { remove: '{{name}}-г хасах', 'clear-all': 'Бүгдийг арилгах' },
          sort: {
            picked: '{{item}}-г авлаа.',
            instructions: 'Зүйлийг авахын тулд Space дарна уу.',
            'pointer-instructions': 'Хулганаар чирж зөөнө үү.',
          },
        },
      },
    },
    interpolation: { escapeValue: false },
  });
});

const render = setupDomRender();

const inMongolian = (node: ReactNode) =>
  render(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);

const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[aria-label]'), (node) => node.getAttribute('aria-label'));

/**
 * What a screen reader hears: the drag instructions, then picking up the item "Нэр". `pointer`
 * for a list only the mouse or touch moves.
 */
const Spoken = ({ pointer = false }: { pointer?: boolean }) => {
  const { announcements, screenReaderInstructions } = useSortAccessibility(String, { pointer });

  return (
    <p>
      {screenReaderInstructions.draggable}{' '}
      {announcements.onDragStart({
        active: {
          id: 'Нэр',
          data: { current: undefined },
          rect: { current: { initial: null, translated: null } },
        },
      })}
    </p>
  );
};

describe("erxes-ui's controls in the app's language", () => {
  it('names the sidebar collapse button in Mongolian', () => {
    const container = inMongolian(
      <MemoryRouter>
        <AppLayout id="ui-language-test" sidebar={<div>Sidebar</div>}>
          <div>Page</div>
        </AppLayout>
      </MemoryRouter>,
    );

    expect(names(container)).toContain('Хажуугийн самбарыг хураах');
  });

  it('names a breadcrumb trail and a badge remove button in Mongolian', () => {
    const container = inMongolian(
      <Breadcrumb>
        <Badge onClose={() => undefined}>VIP</Badge>
      </Breadcrumb>,
    );

    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Замын мөр');
    expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('Хасах');
  });

  it("names a multiselect's remove and clear buttons in Mongolian", () => {
    const container = inMongolian(
      <MultipleSelector value={[{ value: 'vip', label: 'VIP' }]} onChange={() => undefined} />,
    );

    expect(names(container)).toEqual(expect.arrayContaining(['VIP-г хасах', 'Бүгдийг арилгах']));
  });

  it('speaks drag and drop instructions and announcements in Mongolian', () => {
    const container = inMongolian(<Spoken />);

    expect(container.textContent).toBe('Зүйлийг авахын тулд Space дарна уу. Нэр-г авлаа.');
  });

  it('tells a list only the mouse or touch moves to drag, not to press Space', () => {
    const container = inMongolian(<Spoken pointer />);

    expect(container.textContent).toBe('Хулганаар чирж зөөнө үү. Нэр-г авлаа.');
  });
});
