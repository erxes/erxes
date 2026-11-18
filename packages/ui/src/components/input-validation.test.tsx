// @vitest-environment happy-dom
import { createInstance } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Input } from './input';
import { Textarea } from './textarea';

const render = setupDomRender();

const mongolian = createInstance();

void mongolian.use(initReactI18next).init({
  lng: 'mn',
  resources: {
    mn: {
      ui: {
        validation: {
          required: 'Энэ талбарыг бөглөнө үү.',
          email: 'Имэйл хаяг оруулна уу.',
          'too-short': 'Дор хаяж {{count}} тэмдэгт оруулна уу.',
        },
      },
    },
  },
  interpolation: { escapeValue: false },
  initAsync: false,
});

const inMongolian = (node: ReactNode) =>
  render(<I18nextProvider i18n={mongolian}>{node}</I18nextProvider>);

/** The message the browser shows when the field's form is submitted. */
const reported = (field: HTMLInputElement | HTMLTextAreaElement | null) => {
  field?.checkValidity();

  return field?.validationMessage;
};

describe("the browser's validation messages", () => {
  it("are in the UI's language for a required, email or too short field", () => {
    const container = inMongolian(
      <form>
        <Input name="name" required />
        <Input name="email" type="email" defaultValue="bat" />
        <Textarea name="note" minLength={5} defaultValue="hi" />
      </form>,
    );

    const [name, email] = container.querySelectorAll('input');

    expect(reported(name ?? null)).toBe('Энэ талбарыг бөглөнө үү.');
    expect(reported(email ?? null)).toBe('Имэйл хаяг оруулна уу.');
    expect(reported(container.querySelector('textarea'))).toBe('Дор хаяж 5 тэмдэгт оруулна уу.');
  });

  it("leave a message the caller set, and still call the caller's onInvalid", () => {
    const onInvalid = vi.fn<() => void>();

    const container = inMongolian(<Input required onInvalid={onInvalid} />);
    const input = container.querySelector('input');

    input?.setCustomValidity('Pick a plan first');

    expect(reported(input)).toBe('Pick a plan first');
    expect(onInvalid).toHaveBeenCalledOnce();
  });
});
