// @vitest-environment happy-dom
import { act } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { expect, it } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Form } from './form';
import { MultipleSelector } from './multiselect';

const render = setupDomRender();

const OPTIONS = [
  { value: 'EUR', label: 'EUR · Euro' },
  { value: 'JPY', label: 'JPY · Japanese Yen' },
  { value: 'USD', label: 'USD · US Dollar' },
];

/** A form field of codes picked from options, as Settings › General's other currencies. */
const CodesForm = () => {
  const form = useForm<{ codes: string[] }>({ defaultValues: { codes: [] } });
  const codes = useWatch({ control: form.control, name: 'codes' });

  return (
    <Form {...form}>
      <form>
        <Form.Field
          control={form.control}
          name="codes"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Codes</Form.Label>
              <Form.Control>
                <MultipleSelector
                  options={OPTIONS}
                  value={OPTIONS.filter((option) => field.value.includes(option.value))}
                  onChange={(options) => field.onChange(options.map((option) => option.value))}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <output>{codes.join(',')}</output>
      </form>
    </Form>
  );
};

const typeIn = (input: HTMLInputElement, text: string) =>
  act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, text);
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

/** Presses Enter; whether the browser may still do its default, such as submitting the form. */
const pressEnter = async (input: HTMLInputElement) => {
  let allowed = true;

  await act(async () => {
    allowed = input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  return allowed;
};

it('picks the first match of the typed text on Enter, without submitting the form', async () => {
  const container = render(<CodesForm />);
  const input = container.querySelector('input');

  if (!input) throw new Error('No input');

  await typeIn(input, 'yen');
  expect(await pressEnter(input)).toBe(false);

  await typeIn(input, 'us');
  expect(await pressEnter(input)).toBe(false);

  expect(container.querySelector('output')?.textContent).toBe('JPY,USD');
  expect(container.textContent).toContain('JPY · Japanese Yen');
  expect(container.textContent).toContain('USD · US Dollar');
});
