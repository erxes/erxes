import './routerEnvironment';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import type { ControllerProps } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { DataModelFieldForm } from '../components/DataModelFieldForm';
import { DataModelForm } from '../components/DataModelForm';
import { DataModelSettings } from '../components/DataModelSettings';
import { BuiltinModelFieldValue } from '../components/BuiltinModelFields';
import { field, model } from './fixtures';

const mockSave = jest.fn();
const mockMutation = jest.fn();
const mockFields = jest.fn();
const mockBuiltinSave = jest.fn();
const mockRefetch = jest.fn();
let mockManage = true;
jest.mock('../hooks', () => ({
  useDataModelFields: () => mockFields(),
  useDataModelMutation: () => mockMutation(),
}));
jest.mock('ui-modules', () => ({
  usePermissionCheck: () => ({ hasActionPermission: () => mockManage }),
  Can: ({ children }: PropsWithChildren) => <>{children}</>,
}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual<typeof import('@apollo/client')>('@apollo/client'),
  useQuery: () => ({ loading: false }),
  useMutation: () => [
    mockBuiltinSave,
    {
      loading: false,
      error: new Error('Record fields changed; reload it before saving'),
    },
  ],
  useApolloClient: () => ({ refetchQueries: mockRefetch }),
}));
jest.mock('../components/DataModelRelationSettings', () => ({
  DataModelRelationSettings: () => null,
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { FormProvider, Controller, useFormContext } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const FieldContext = React.createContext('');
  const CollapsibleContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({
    open: false,
    onOpenChange: () => undefined,
  });
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Field = (props: ControllerProps) => (
    <FieldContext.Provider value={props.name}>
      <Controller {...props} />
    </FieldContext.Provider>
  );
  const Label = ({ children }: PropsWithChildren) => (
    <label htmlFor={React.useContext(FieldContext)}>{children}</label>
  );
  const Input = React.forwardRef<HTMLInputElement, ComponentProps<'input'>>(
    (props, ref) => (
      <input {...props} ref={ref} id={React.useContext(FieldContext)} />
    ),
  );
  const Message = () => {
    const name = React.useContext(FieldContext);
    const { getFieldState, formState } = useFormContext();
    const error = getFieldState(name, formState).error;
    return error ? <p role="alert">{error.message}</p> : null;
  };
  return {
    useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(undefined) }),
    toast: jest.fn(),
    Input,
    Textarea: React.forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
      (props, ref) => (
        <textarea {...props} ref={ref} id={React.useContext(FieldContext)} />
      ),
    ),
    IconComponent: () => null,
    IconPicker: ({
      value,
      onValueChange,
      disabled,
    }: {
      value: string;
      onValueChange: (value: string) => void;
      disabled: boolean;
    }) => (
      <button
        type="button"
        disabled={disabled}
        aria-label="Object icon"
        onClick={() => onValueChange('IconBuilding')}
      >
        {value}
      </button>
    ),
    Button: ({
      children,
      type,
      disabled,
      onClick,
      'aria-label': label,
    }: ComponentProps<'button'>) => (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
      >
        {children}
      </button>
    ),
    Form: Object.assign(FormProvider, {
      Field,
      Label,
      Message,
      Item: Container,
      Control: ({ children }: PropsWithChildren) => <>{children}</>,
      Description: Container,
    }),
    Sheet: Object.assign(Container, {
      View: Container,
      Header: Container,
      Title: Container,
      Description: Container,
      Content: Container,
      Footer: Container,
      Close: () => null,
    }),
    Select: Object.assign(
      ({
        children,
        value,
        onValueChange,
        disabled,
      }: PropsWithChildren<{
        value: string;
        onValueChange: (value: string) => void;
        disabled?: boolean;
      }>) => (
        <select
          id={React.useContext(FieldContext)}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
        >
          {children}
        </select>
      ),
      {
        Trigger: () => null,
        Value: () => null,
        Content: ({ children }: PropsWithChildren) => <>{children}</>,
        Item: (props: ComponentProps<'option'>) => <option {...props} />,
      },
    ),
    Switch: ({
      checked,
      onCheckedChange,
      disabled,
    }: {
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled: boolean;
    }) => (
      <input
        id={React.useContext(FieldContext)}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
    ),
    Collapsible: Object.assign(
      ({
        children,
        open,
        onOpenChange,
      }: PropsWithChildren<{
        open: boolean;
        onOpenChange: (open: boolean) => void;
      }>) => (
        <CollapsibleContext.Provider value={{ open, onOpenChange }}>
          {children}
        </CollapsibleContext.Provider>
      ),
      {
        Trigger: ({
          children,
        }: {
          children: ReactElement<{ onClick?: () => void }>;
        }) => {
          const { open, onOpenChange } = React.useContext(CollapsibleContext);
          return React.cloneElement(children, {
            onClick: () => onOpenChange(!open),
          });
        },
        Content: ({ children }: PropsWithChildren) =>
          React.useContext(CollapsibleContext).open ? <>{children}</> : null,
      },
    ),
  };
});

beforeEach(() => {
  mockManage = true;
  mockBuiltinSave.mockReset().mockResolvedValue({ data: undefined });
  mockRefetch.mockReset().mockResolvedValue(undefined);
  mockSave.mockReset().mockResolvedValue({ data: { saved: true } });
  mockMutation
    .mockReset()
    .mockReturnValue([mockSave, { loading: false, reset: jest.fn() }]);
  mockFields
    .mockReset()
    .mockReturnValue({ fields: [], loading: false, retry: jest.fn() });
});

it('retains built-in entries when a conflict returns no successful mutation data', async () => {
  const title = field();
  render(
    <BuiltinModelFieldValue
      model="customer"
      field={title}
      fields={[title]}
      record={{ _id: 'customer-a', _dataModelVersion: 7 }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit Title' }));
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Keep this value' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save model fields' }));
  await waitFor(() => expect(mockBuiltinSave).toHaveBeenCalledTimes(1));
  expect(
    screen.getByRole('button', { name: 'Save model fields' }),
  ).toBeTruthy();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Keep this value',
  );
  expect(mockRefetch).not.toHaveBeenCalled();
});

it('creates a field from its visible name and type without requiring an API name', async () => {
  render(<DataModelFieldForm model={model} onClose={jest.fn()} />);
  expect(screen.queryByLabelText('API name')).toBeNull();
  fireEvent.change(screen.getByLabelText('Field name'), {
    target: { value: 'Delivery date' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Change type' }));
  fireEvent.click(screen.getByRole('button', { name: /^Date and time/ }));
  fireEvent.click(screen.getByLabelText('Require a value'));
  fireEvent.click(screen.getByRole('button', { name: 'Create field' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        dataModelId: model._id,
        input: {
          name: 'deliveryDate',
          autoName: true,
          label: 'Delivery date',
          type: 'date',
          required: true,
          description: '',
          options: [],
        },
      },
    }),
  );
});

it('validates choices and lets users add and remove rows before saving', async () => {
  render(<DataModelFieldForm model={model} onClose={jest.fn()} />);
  fireEvent.change(screen.getByLabelText('Field name'), {
    target: { value: 'Status' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Change type' }));
  fireEvent.click(screen.getByRole('button', { name: /^Single select/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Create field' }));
  await screen.findByText('Add at least one option.');
  expect(mockSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Add option' }));
  fireEvent.change(screen.getByLabelText('Option 1'), {
    target: { value: 'Ready' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add option' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove option 2' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create field' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            options: [{ label: 'Ready', value: 'ready' }],
          }),
        }),
      }),
    ),
  );
});

it('renames saved choices without changing the values used by existing records', async () => {
  const saved = field({
    type: 'select',
    options: [{ label: 'In stock', value: 'inStock' }],
  });
  render(
    <DataModelFieldForm model={model} field={saved} onClose={jest.fn()} />,
  );
  expect(
    screen
      .getByRole('button', { name: 'Remove option 1' })
      .hasAttribute('disabled'),
  ).toBe(true);
  fireEvent.change(screen.getByLabelText('Option 1'), {
    target: { value: 'Available' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add option' }));
  fireEvent.change(screen.getByLabelText('Option 2'), {
    target: { value: 'In stock' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save field' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        dataModelId: model._id,
        _id: saved._id,
        expectedVersion: saved.version,
        input: {
          label: saved.label,
          required: false,
          description: '',
          options: [
            { label: 'Available', value: 'inStock' },
            { label: 'In stock', value: 'inStock2' },
          ],
        },
      },
    }),
  );
});

it('creates a ready-to-use status field from a suggestion without typing choices', async () => {
  render(<DataModelFieldForm model={model} onClose={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Status' }));
  expect((screen.getByLabelText('Field name') as HTMLInputElement).value).toBe(
    'Status',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create field' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            name: 'status',
            type: 'select',
            options: [
              { label: 'Not started', value: 'notStarted' },
              { label: 'In progress', value: 'inProgress' },
              { label: 'Done', value: 'done' },
            ],
          }),
        }),
      }),
    ),
  );
});

it('fills object names from a suggestion while keeping them editable', async () => {
  render(
    <MemoryRouter>
      <DataModelForm onClose={jest.fn()} />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vehicles' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create model' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'vehicle',
          labelSingular: 'Vehicle',
          labelPlural: 'Vehicles',
          description: '',
        },
      },
    }),
  );
});

it('generates the object API name while preserving an explicit override', async () => {
  render(
    <MemoryRouter>
      <DataModelForm onClose={jest.fn()} />
    </MemoryRouter>,
  );
  expect(screen.queryByLabelText('API name')).toBeNull();
  fireEvent.change(screen.getByLabelText('Name for one record'), {
    target: { value: 'Office location' },
  });
  fireEvent.change(screen.getByLabelText('Name for a list'), {
    target: { value: 'Office locations' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'More settings' }));
  expect((screen.getByLabelText('API name') as HTMLInputElement).value).toBe(
    'office_location',
  );
  fireEvent.change(screen.getByLabelText('API name'), {
    target: { value: 'branch' },
  });
  fireEvent.change(screen.getByLabelText('Name for one record'), {
    target: { value: 'Branch' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create model' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'branch',
          labelSingular: 'Branch',
          labelPlural: 'Office locations',
          description: '',
        },
      },
    }),
  );
});

it('saves built-in display settings inline without changing its identity or allowing archive', async () => {
  const builtin = {
    ...model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
    systemFields: [
      { code: 'firstName', name: 'First name', type: 'text' },
      { code: 'avatar', name: 'Avatar', type: 'file' },
    ],
  };
  const updated = {
    ...builtin,
    labelSingular: 'Person',
    icon: 'IconBuilding',
    recordLabelField: 'firstName',
    recordImageField: 'avatar',
    version: 2,
  };
  mockSave.mockResolvedValue({ data: { dataModelUpdate: updated } });
  render(
    <DataModelSettings
      model={builtin}
      onReload={jest.fn()}
      onArchive={jest.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Archive object' })).toBeNull();
  fireEvent.change(screen.getByLabelText('Singular'), {
    target: { value: 'Person' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Object icon' }));
  fireEvent.change(screen.getByLabelText('Record label'), {
    target: { value: 'field:firstName' },
  });
  fireEvent.change(screen.getByLabelText('Record image'), {
    target: { value: 'field:avatar' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        _id: builtin._id,
        expectedVersion: 1,
        input: {
          labelSingular: 'Person',
          icon: 'IconBuilding',
          recordLabelField: 'firstName',
          recordImageField: 'avatar',
        },
      },
    }),
  );
  await screen.findByText('All changes saved');
  expect(
    screen
      .getByRole('button', { name: 'Save changes' })
      .hasAttribute('disabled'),
  ).toBe(true);
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'People we work with' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenLastCalledWith({
      variables: {
        _id: builtin._id,
        expectedVersion: 2,
        input: { description: 'People we work with' },
      },
    }),
  );
});

it('retains the opening version and unsaved values during background updates and conflicts', async () => {
  mockSave.mockRejectedValue(
    new Error('Data model changed; reload it before saving'),
  );
  const latest = { ...model, version: 2, labelSingular: 'Saved elsewhere' };
  const reload = jest.fn().mockResolvedValue(latest);
  const { rerender } = render(
    <DataModelSettings model={model} onReload={reload} onArchive={jest.fn()} />,
  );
  fireEvent.change(screen.getByLabelText('Singular'), {
    target: { value: 'Unsaved name' },
  });
  rerender(
    <DataModelSettings
      model={latest}
      onReload={reload}
      onArchive={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        _id: model._id,
        expectedVersion: 1,
        input: { labelSingular: 'Unsaved name' },
      },
    }),
  );
  expect((screen.getByLabelText('Singular') as HTMLInputElement).value).toBe(
    'Unsaved name',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reload latest' }));
  await waitFor(() =>
    expect((screen.getByLabelText('Singular') as HTMLInputElement).value).toBe(
      'Saved elsewhere',
    ),
  );
  expect(
    screen
      .getByRole('button', { name: 'Save changes' })
      .hasAttribute('disabled'),
  ).toBe(true);
});

it('validates names and limits custom record display choices to supported fields', async () => {
  mockFields.mockReturnValue({
    fields: [
      field(),
      field({ _id: 'cost', label: 'Cost', type: 'number' }),
      field({ _id: 'link', label: 'Owner', type: 'relation' }),
    ],
    loading: false,
  });
  render(
    <DataModelSettings
      model={model}
      onReload={jest.fn()}
      onArchive={jest.fn()}
    />,
  );
  const label = screen.getByLabelText('Record label');
  expect(label.textContent).toContain('Title');
  expect(label.textContent).not.toContain('Cost');
  expect(label.textContent).not.toContain('Owner');
  fireEvent.change(screen.getByLabelText('Singular'), {
    target: { value: '' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText('Enter a singular name.');
  expect(mockSave).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole('button', { name: 'Archive object' })
      .hasAttribute('disabled'),
  ).toBe(true);
});

it('keeps settings readable without exposing management actions to readers', () => {
  mockManage = false;
  render(
    <DataModelSettings
      model={model}
      onReload={jest.fn()}
      onArchive={jest.fn()}
    />,
  );
  expect(screen.getByLabelText('Singular').hasAttribute('disabled')).toBe(true);
  expect(screen.getByLabelText('Record label').hasAttribute('disabled')).toBe(
    true,
  );
  expect(
    screen
      .getByRole('button', { name: 'Object icon' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Archive object' })).toBeNull();
});
