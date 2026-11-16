// @vitest-environment happy-dom
import { act, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Form } from './form';
import { Input } from './input';

const render = setupDomRender();

/** A form whose fields never render again from above, as the React Compiler leaves them. */
const NameForm = () => {
  const form = useForm({ defaultValues: { name: '' } });

  const fields = useMemo(
    () => (
      <Form.Field
        name="name"
        rules={{ required: 'Enter a name' }}
        render={({ field }) => (
          <Form.Item>
            <Form.Label required>Name</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    ),
    [],
  );

  return (
    <Form {...form}>
      <form onSubmit={(event) => void form.handleSubmit(() => undefined)(event)}>
        {fields}
        <button type="submit">Save</button>
      </form>
    </Form>
  );
};

describe('Form', () => {
  it('shows a field’s error under it after Save, and marks the field and its label', async () => {
    const container = render(<NameForm />);

    expect(container.textContent).not.toContain('Enter a name');

    await act(async () => {
      container.querySelector('button')?.click();
      await Promise.resolve();
    });

    const input = container.querySelector('input');

    expect(container.querySelector('p')?.textContent).toBe('Enter a name');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('label')?.textContent).toBe('Name *');
  });
});
