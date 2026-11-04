import type { InputHTMLAttributes, PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { KbFormSheet } from '../KbFormSheet';
import { KbTextField } from '../KbTextField';

jest.mock('../KbFormLayout', () => ({
  KbFormItem: ({ children }: PropsWithChildren) => <div>{children}</div>,
  KbFormPanelContext: jest
    .requireActual<typeof import('react')>('react')
    .createContext(false),
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Form: {
      Field:
        jest.requireActual<typeof import('react-hook-form')>('react-hook-form')
          .Controller,
      Control: Box,
      Description: Box,
      Message: () => null,
    },
    Input: React.forwardRef<
      HTMLInputElement,
      InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input {...props} ref={ref} />),
    Textarea: 'textarea',
    cn: () => '',
  };
});

function Fields() {
  const { control } = useForm({ defaultValues: { title: '', summary: '' } });
  return (
    <>
      <KbTextField
        control={control}
        name="title"
        label="Title"
        placeholder="Title"
      />
      <KbTextField
        control={control}
        name="summary"
        label="Summary"
        placeholder="Summary"
        multiline
      />
      <input
        aria-label="Selector"
        role="combobox"
        aria-controls="options"
        aria-expanded={false}
      />
    </>
  );
}

jest.mock('ui-modules', () => ({
  PanelFormLayout: ({ children }: PropsWithChildren) => (
    <div>
      {children}
      <button type="submit">Save</button>
    </div>
  ),
}));

it('removes a reaction without saving the containing form', () => {
  const save = jest.fn();
  const remove = jest.fn();
  render(
    <KbFormSheet
      onClose={jest.fn()}
      submitLabel="Save"
      loading={false}
      onSubmit={save}
    >
      <button onClick={remove}>Remove reaction</button>
    </KbFormSheet>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove reaction' }));
  expect(remove).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
});

it('saves when the panel Save button explicitly submits', () => {
  const save = jest.fn();
  render(
    <KbFormSheet
      onClose={jest.fn()}
      submitLabel="Save"
      loading={false}
      onSubmit={save}
    >
      <input aria-label="Title" />
    </KbFormSheet>,
  );
  const saveButton = screen.getByRole('button', { name: 'Save' });
  const form = saveButton.closest('form');
  if (!form) throw new Error('Expected a containing form');
  const event = createEvent.submit(form);
  Object.defineProperty(event, 'submitter', { value: saveButton });
  fireEvent(form, event);
  expect(save).toHaveBeenCalledTimes(1);
});

it('ignores an untyped submitter even though its default button type is submit', () => {
  const save = jest.fn();
  render(
    <KbFormSheet
      onClose={jest.fn()}
      submitLabel="Save"
      loading={false}
      onSubmit={save}
    >
      <button>Remove reaction</button>
    </KbFormSheet>,
  );
  const removeButton = screen.getByRole('button', { name: 'Remove reaction' });
  const form = removeButton.closest('form');
  if (!form) throw new Error('Expected a containing form');
  const event = createEvent.submit(form);
  Object.defineProperty(event, 'submitter', { value: removeButton });
  fireEvent(form, event);
  expect(save).not.toHaveBeenCalled();
});

it('prevents Enter in a text input before the browser activates a default chip button', () => {
  render(
    <KbFormSheet
      onClose={jest.fn()}
      submitLabel="Save"
      loading={false}
      onSubmit={jest.fn()}
    >
      <Fields />
      <button>Remove reaction</button>
    </KbFormSheet>,
  );
  const title = screen.getByPlaceholderText('Title');
  const enter = createEvent.keyDown(title, {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(title, enter);
  expect(enter.defaultPrevented).toBe(true);

  for (const target of [
    screen.getByPlaceholderText('Summary'),
    screen.getByLabelText('Selector'),
  ]) {
    const allowed = createEvent.keyDown(target, {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(target, allowed);
    expect(allowed.defaultPrevented).toBe(false);
  }
  const composition = createEvent.keyDown(title, {
    key: 'Enter',
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(title, composition);
  expect(composition.defaultPrevented).toBe(false);
  for (const properties of [{ key: 'Enter', keyCode: 229 }, { key: 'a' }]) {
    const allowed = createEvent.keyDown(title, {
      ...properties,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(title, allowed);
    expect(allowed.defaultPrevented).toBe(false);
  }
});

it('keeps Enter available in text fields outside the panel form', () => {
  render(<Fields />);
  const title = screen.getByPlaceholderText('Title');
  const event = createEvent.keyDown(title, {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(title, event);
  expect(event.defaultPrevented).toBe(false);
});
