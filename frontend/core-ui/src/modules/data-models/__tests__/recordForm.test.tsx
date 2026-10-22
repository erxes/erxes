import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren, ComponentProps } from 'react';
import type { ControllerProps } from 'react-hook-form';
import { print } from 'graphql';
import { DataModelRecordForm } from '../components/DataModelRecordForm';
import type { ModelField } from '../types';
import { field, model, record } from './fixtures';

const mockSave = jest.fn();
const mockMutationHook = jest.fn();
const mockConfirm = jest.fn();

jest.mock('../hooks', () => ({
  useDataModelMutation: (...args: unknown[]) => mockMutationHook(...args),
}));
jest.mock('../components/DataModelRecordInput', () => ({
  DataModelRecordInput: ({
    field: definition,
    value,
    onChange,
    id,
    disabled,
  }: {
    field: ModelField;
    value: unknown;
    onChange: (next: unknown) => void;
    id: string;
    disabled: boolean;
  }) => (
    <input
      id={id}
      aria-label={definition.label}
      disabled={disabled}
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(event) =>
        onChange(
          definition.type === 'number'
            ? Number(event.target.value)
            : definition.type === 'boolean'
            ? event.target.value === 'true'
            : event.target.value,
        )
      }
    />
  ),
}));

jest.mock('erxes-ui', () => {
  const React: typeof import('react') = require('react');
  const {
    FormProvider,
    Controller,
    useFormContext,
  }: typeof import('react-hook-form') = require('react-hook-form');
  const FieldContext = React.createContext('');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const FormField = (props: ControllerProps) => (
    <FieldContext.Provider value={props.name}>
      <Controller {...props} />
    </FieldContext.Provider>
  );
  const Message = () => {
    const name = React.useContext(FieldContext);
    const { getFieldState, formState } = useFormContext();
    const error = getFieldState(name, formState).error;
    return error ? <p role="alert">{error.message}</p> : null;
  };
  return {
    useConfirm: () => ({ confirm: mockConfirm }),
    Button: ({
      children,
      type,
      disabled,
      onClick,
    }: ComponentProps<'button'>) => (
      <button type={type} disabled={disabled} onClick={onClick}>
        {children}
      </button>
    ),
    Sheet: Object.assign(Container, {
      View: Container,
      Header: Container,
      Content: Container,
      Footer: Container,
      Title: Container,
      Description: Container,
      Close: () => null,
    }),
    Form: Object.assign(FormProvider, {
      Field: FormField,
      Item: Container,
      Label: ({ children, htmlFor }: ComponentProps<'label'>) => (
        <label htmlFor={htmlFor}>{children}</label>
      ),
      Message,
    }),
  };
});

beforeEach(() => {
  mockConfirm.mockReset().mockResolvedValue(undefined);
  mockSave.mockReset().mockResolvedValue({ data: { saved: record } });
  mockMutationHook
    .mockReset()
    .mockReturnValue([mockSave, { loading: false, error: undefined }]);
});

it('keeps unsaved entries when the user cancels the discard confirmation', async () => {
  mockConfirm.mockRejectedValue(new Error('Keep editing'));
  const onClose = jest.fn();
  render(
    <DataModelRecordForm
      model={model}
      record={record}
      fields={[field()]}
      onClose={onClose}
    />,
  );
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Unsaved title' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
  expect(onClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Unsaved title',
  );
});

it('validates required values before calling a mutation', async () => {
  const onClose = jest.fn();
  render(
    <DataModelRecordForm
      model={model}
      fields={[field({ required: true })]}
      onClose={onClose}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create record' }));
  await screen.findByText('Title is required.');
  expect(mockSave).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Laptop' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create record' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        input: { title: 'Laptop', _modelVersion: 1 },
      },
    }),
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('sends only dirty values with the snapshot version, not untouched historical values', async () => {
  const fields = [
    field(),
    field({ _id: 'cost', name: 'cost', label: 'Cost', type: 'number' }),
    field({
      _id: 'enabled',
      name: 'enabled',
      label: 'Enabled',
      type: 'boolean',
    }),
  ];
  const onClose = jest.fn();
  render(
    <DataModelRecordForm
      model={model}
      record={record}
      fields={fields}
      onClose={onClose}
    />,
  );
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Monitor' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        _id: record._id,
        expectedVersion: 7,
        input: { title: 'Monitor', _modelVersion: 1 },
      },
    }),
  );
  expect(print(mockMutationHook.mock.calls[0][0])).toContain(
    'dataModel_assetUpdate',
  );
});

it('keeps the editor open and values intact when Apollo reports a conflict without data', async () => {
  mockSave.mockResolvedValue({ data: undefined });
  const onClose = jest.fn();
  render(
    <DataModelRecordForm
      model={model}
      record={record}
      fields={[field()]}
      onClose={onClose}
    />,
  );
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Unsaved title' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(onClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Unsaved title',
  );
});

it('restores deleted records with newly required values and the original expected version', async () => {
  const onClose = jest.fn();
  render(
    <DataModelRecordForm
      model={model}
      record={{ ...record, deletedAt: '2026-10-22T01:00:00Z' }}
      fields={[
        field(),
        field({
          _id: 'serial',
          name: 'serial',
          label: 'Serial',
          required: true,
        }),
      ]}
      onClose={onClose}
    />,
  );
  fireEvent.change(screen.getByLabelText('Serial'), {
    target: { value: 'SER-1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Restore record' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: {
        _id: record._id,
        expectedVersion: 7,
        input: { serial: 'SER-1', _modelVersion: 1 },
      },
    }),
  );
  expect(print(mockMutationHook.mock.calls[0][0])).toContain(
    'dataModel_assetRestore',
  );
});

it('blocks a missing required field that the runtime cannot write', () => {
  render(
    <DataModelRecordForm
      model={model}
      fields={[field({ type: 'file', required: true })]}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByRole('alert').textContent).toContain(
    'Required fields cannot be filled',
  );
  expect(
    (screen.getByRole('button', { name: 'Create record' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
