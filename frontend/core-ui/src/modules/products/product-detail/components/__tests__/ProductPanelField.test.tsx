/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IconPackage, IconWeight } from '@tabler/icons-react';
import { Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import {
  ProductPanelNumberField,
  ProductPanelTextField,
} from '../ProductPanelField';

jest.mock('erxes-ui/components', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Input: React.forwardRef<
      HTMLInputElement,
      React.InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input ref={ref} {...props} />),
    TextOverflowTooltip: ({ value }: { value?: string }) => (
      <span>{value}</span>
    ),
  };
});

jest.mock('erxes-ui/modules/hotkey', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const context = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({
    open: false,
    onOpenChange: () => undefined,
  });
  return {
    context,
    PopoverScoped: ({
      children,
      open,
      onOpenChange,
    }: React.PropsWithChildren<{
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }>) => (
      <context.Provider value={{ open, onOpenChange }}>
        {children}
      </context.Provider>
    ),
  };
});

jest.mock('erxes-ui/modules/record-table', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { createPortal } =
    jest.requireActual<typeof import('react-dom')>('react-dom');
  const { context } = jest.requireMock('erxes-ui/modules/hotkey') as {
    context: React.Context<{
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }>;
  };
  return {
    RecordTableInlineCell: {
      Trigger: React.forwardRef<
        HTMLButtonElement,
        React.ButtonHTMLAttributes<HTMLButtonElement>
      >((props, ref) => {
        const { onOpenChange } = React.useContext(context);
        return (
          <button
            {...props}
            ref={ref}
            type="button"
            onClick={() => onOpenChange(true)}
          />
        );
      }),
      Content: ({
        children,
        onEscapeKeyDown,
      }: React.PropsWithChildren<{
        onEscapeKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
      }>) => {
        const { open, onOpenChange } = React.useContext(context);
        return open
          ? createPortal(
              <div
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    onEscapeKeyDown?.(event);
                    onOpenChange(false);
                  }
                }}
              >
                {children}
              </div>,
              globalThis.document.body,
            )
          : null;
      },
    },
  };
});

jest.mock('erxes-ui', () => ({
  Form: jest.requireActual('erxes-ui/components/form').Form,
  TextField: jest.requireActual(
    'erxes-ui/modules/record-field/components/TextField',
  ).TextField,
  Input: jest.requireMock('erxes-ui/components').Input,
  PopoverScoped: jest.requireMock('erxes-ui/modules/hotkey').PopoverScoped,
  RecordTableInlineCell: jest.requireMock('erxes-ui/modules/record-table')
    .RecordTableInlineCell,
  cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
}));

jest.mock('ui-modules', () => ({
  PANEL_TEXT_FIELD_CLASS_NAME: '',
  PanelField: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PanelFieldTrigger: jest.requireMock('erxes-ui/modules/record-table')
    .RecordTableInlineCell.Trigger,
}));

const ProductForm = ({
  onSave,
}: {
  onSave: (values: ProductFormValues) => void;
}) => {
  const form = useForm<ProductFormValues>({
    defaultValues: { name: 'Original', weight: undefined },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)}>
        <ProductPanelTextField name="name" label="Name" icon={IconPackage} />
        <ProductPanelNumberField
          name="weight"
          label="Weight"
          icon={IconWeight}
        />
        <button type="submit">Save product</button>
      </form>
    </Form>
  );
};

it('commits an inline text edit to the draft without submitting the product', async () => {
  const save = jest.fn();
  render(<ProductForm onSave={save} />);
  fireEvent.click(screen.getByRole('button', { name: 'Name' }));
  const input = screen.getByPlaceholderText('Name');
  fireEvent.change(input, { target: { value: 'Changed' } });
  const editorForm = input.closest('form');
  if (!editorForm) throw new Error('Inline editor form is missing');
  fireEvent.submit(editorForm);
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Name' }).textContent).toBe(
    'Changed',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save product' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].name).toBe('Changed');
});

it('preserves zero and allows clearing an optional numeric value before Save', async () => {
  const save = jest.fn();
  render(<ProductForm onSave={save} />);
  fireEvent.click(screen.getByRole('button', { name: 'Weight' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight' }), {
    target: { value: '0' },
  });
  fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Weight' }), {
    key: 'Enter',
  });
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Weight' }).textContent).toBe('0');
  fireEvent.click(screen.getByRole('button', { name: 'Save product' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0].weight).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Weight' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight' }), {
    target: { value: '' },
  });
  fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Weight' }), {
    key: 'Enter',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save product' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1][0].weight).toBeUndefined();
});

it('restores the numeric value when the user cancels with Escape', async () => {
  const save = jest.fn();
  render(<ProductForm onSave={save} />);
  fireEvent.click(screen.getByRole('button', { name: 'Weight' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Weight' }), {
    target: { value: '12' },
  });
  fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Weight' }), {
    key: 'Escape',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save product' }));
  await waitFor(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0].weight).toBeUndefined();
});
