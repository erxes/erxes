import './routerEnvironment';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps, PropsWithChildren } from 'react';
import { DataModelFields } from '../components/DataModelFields';
import { DATA_MODEL_FIELD_ARCHIVE, DATA_MODEL_FIELD_RESTORE } from '../graphql';
import { field, model } from './fixtures';
import type { ModelField } from '../types';

const mockFields = jest.fn();
jest.mock('../components/DataModelTargetLink', () => ({
  DataModelTargetLink: () => <span>Related object</span>,
}));
const mockSave = jest.fn();
const mockMutation = jest.fn();
let mockManage = true;
jest.mock('../hooks', () => ({
  useDataModelFields: (...args: unknown[]) => mockFields(...args),
  useDataModelMutation: (...args: unknown[]) => mockMutation(...args),
}));
jest.mock('ui-modules', () => ({
  Can: ({
    children,
    fallback,
  }: PropsWithChildren<{ fallback?: React.ReactNode }>) => (
    <>{mockManage ? children : fallback}</>
  ),
}));
jest.mock('../components/DataModelFieldForm', () => ({
  DataModelFieldForm: ({
    field: selected,
    initialType,
    onArchive,
    onClose,
  }: {
    field?: ModelField;
    initialType?: 'text' | 'relation';
    onArchive?: () => void;
    onClose: () => void;
  }) => (
    <div
      role="dialog"
      aria-label={
        selected
          ? `Edit ${selected.label}`
          : initialType === 'relation'
          ? 'New model relation'
          : 'New model field'
      }
    >
      {onArchive && (
        <button onClick={onArchive}>Archive {selected?.label}</button>
      )}
      <button onClick={onClose}>Close editor</button>
    </div>
  ),
}));
jest.mock('erxes-ui', () => {
  const { Children, isValidElement } =
    jest.requireActual<typeof import('react')>('react');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Input: (props: ComponentProps<'input'>) => <input {...props} />,
    Popover: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    Collapsible: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    Sheet: Object.assign(Container, {
      View: Container,
      Header: Container,
      Title: Container,
      Description: Container,
      Content: Container,
      Close: () => null,
    }),
    Button: ({
      children,
      onClick,
      disabled,
      'aria-label': label,
    }: ComponentProps<'button'>) => (
      <button onClick={onClick} disabled={disabled} aria-label={label}>
        {children}
      </button>
    ),
    Table: Object.assign(Container, {
      Header: Container,
      Row: Container,
      Head: Container,
      Body: Container,
      Cell: Container,
    }),
    Select: Object.assign(
      ({
        children,
        value,
        onValueChange,
      }: PropsWithChildren<{
        value: string;
        onValueChange: (value: string) => void;
      }>) => (
        <>
          <select
            aria-label={Children.toArray(children)
              .map((child) =>
                isValidElement<{ 'aria-label'?: string }>(child)
                  ? child.props['aria-label']
                  : undefined,
              )
              .find(Boolean)}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          >
            {(['active', 'archived'].includes(value)
              ? ['active', 'archived']
              : ['all', 'system', 'custom']
            ).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {children}
        </>
      ),
      {
        Trigger: () => null,
        Value: () => null,
        Content: () => null,
        Item: () => null,
      },
    ),
    AlertDialog: Object.assign(Container, {
      Content: Container,
      Header: Container,
      Title: Container,
      Description: Container,
      Footer: Container,
    }),
  };
});

beforeEach(() => {
  mockManage = true;
  mockFields.mockReset().mockReturnValue({
    fields: [field()],
    loading: false,
    error: undefined,
    retry: jest.fn(),
  });
  mockSave.mockReset().mockResolvedValue({ data: { saved: field() } });
  mockMutation
    .mockReset()
    .mockReturnValue([mockSave, { loading: false, error: undefined }]);
});

it('opens a Data Models-owned field editor inline and never links to Properties', () => {
  render(<DataModelFields model={model} />);
  expect(screen.getByText('Title')).toBeTruthy();
  expect(screen.getByText(/dataModel_assetList/)).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Add field' }));
  expect(screen.getByRole('dialog', { name: 'New model field' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  fireEvent.click(screen.getByRole('button', { name: 'Title' }));
  expect(screen.getByRole('dialog', { name: 'Edit Title' })).toBeTruthy();
});

it('archives a field with its snapshot version after confirmation', async () => {
  render(<DataModelFields model={model} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit Title' }));
  fireEvent.click(screen.getByRole('button', { name: 'Archive Title' }));
  fireEvent.click(screen.getByRole('button', { name: 'Archive field' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith({
      variables: { dataModelId: model._id, _id: 'title', expectedVersion: 1 },
    }),
  );
  expect(mockMutation).toHaveBeenCalledWith(
    DATA_MODEL_FIELD_ARCHIVE,
    'Field archived',
  );
});

it('queries archived metadata and restores the existing field instead of recreating it', async () => {
  mockFields.mockReturnValue({
    fields: [field({ archivedAt: '2026-10-22' })],
    loading: false,
    error: undefined,
    retry: jest.fn(),
  });
  render(<DataModelFields model={model} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Field status' }), {
    target: { value: 'archived' },
  });
  expect(mockFields).toHaveBeenLastCalledWith(model._id, true);
  expect(screen.queryByText('ID')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Restore Title' }));
  fireEvent.click(screen.getByRole('button', { name: 'Restore field' }));
  await waitFor(() => expect(mockSave).toHaveBeenCalled());
  expect(mockMutation).toHaveBeenCalledWith(
    DATA_MODEL_FIELD_RESTORE,
    'Field restored',
  );
});

it('searches system and custom fields and keeps system definitions read-only', () => {
  render(<DataModelFields model={model} />);
  const chevron = screen.getByRole('button', {
    name: 'ID is managed by erxes',
  });
  expect(chevron.hasAttribute('disabled')).toBe(true);
  expect(screen.queryByRole('button', { name: 'ID' })).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search fields' }), {
    target: { value: 'title' },
  });
  expect(screen.queryByText('ID')).toBeNull();
  expect(screen.getByRole('button', { name: 'Title' })).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search fields' }), {
    target: { value: '' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'ID is managed by erxes' }),
  );
  expect(screen.queryByText('Field details')).toBeNull();
  expect(screen.queryByRole('dialog', { name: 'Edit ID' })).toBeNull();
});

it('filters field source without changing field lifecycle status', () => {
  render(<DataModelFields model={model} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Field source' }), {
    target: { value: 'system' },
  });
  expect(screen.getByText('ID')).toBeTruthy();
  expect(
    screen
      .getByRole('button', { name: 'ID is managed by erxes' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(screen.queryByRole('button', { name: 'Title' })).toBeNull();
  expect(mockFields).toHaveBeenLastCalledWith(model._id, false);
});

const relation = (inverse = false): ModelField =>
  field({
    _id: 'building-link',
    name: 'building',
    label: 'Building',
    type: 'relation',
    relation: {
      targetModelId: 'building-model',
      multiple: inverse,
      inverseFieldId: 'assets-link',
      isInverse: inverse,
    },
  });

it('separates relations from fields with independent searches and creation flows', () => {
  mockFields.mockReturnValue({
    fields: [field(), relation()],
    loading: false,
    retry: jest.fn(),
  });
  render(<DataModelFields model={model} />);
  const relations = within(screen.getByRole('region', { name: 'Relations' }));
  const fields = within(screen.getByRole('region', { name: 'Fields' }));
  expect(relations.getByRole('button', { name: 'Building' })).toBeTruthy();
  expect(relations.getByText('Belongs to')).toBeTruthy();
  expect(fields.queryByRole('button', { name: 'Building' })).toBeNull();
  fireEvent.change(
    relations.getByRole('textbox', { name: 'Search relations' }),
    { target: { value: 'missing' } },
  );
  expect(relations.queryByRole('button', { name: 'Building' })).toBeNull();
  expect(fields.getByRole('button', { name: 'Title' })).toBeTruthy();
  fireEvent.click(relations.getByRole('button', { name: 'Add relation' }));
  expect(
    screen.getByRole('dialog', { name: 'New model relation' }),
  ).toBeTruthy();
});

it('inspects inverse relations and links to their owner without edit or archive controls', () => {
  mockFields.mockReturnValue({
    fields: [relation(true)],
    loading: false,
    retry: jest.fn(),
  });
  render(
    <MemoryRouter>
      <DataModelFields model={model} />
    </MemoryRouter>,
  );
  expect(screen.getByText('Has many')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Edit Building' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Archive Building' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'View Building' }));
  expect(
    screen
      .getByRole('link', { name: 'Open related object' })
      .getAttribute('href'),
  ).toBe('/settings/data-models/building-model');
  expect(screen.queryByRole('dialog', { name: 'Edit Building' })).toBeNull();
});

it('keeps relation lifecycle filters independent from scalar fields', () => {
  mockFields.mockImplementation((_id: string, archived: boolean) => ({
    fields: archived ? [relation(true)] : [field(), relation()],
    loading: false,
    retry: jest.fn(),
  }));
  render(<DataModelFields model={model} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Relation status' }), {
    target: { value: 'archived' },
  });
  expect(
    within(screen.getByRole('region', { name: 'Fields' })).getByRole('button', {
      name: 'Title',
    }),
  ).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Restore Building' })).toBeNull();
  expect(screen.getByRole('button', { name: 'View Building' })).toBeTruthy();
});

it('lets readers inspect custom fields without exposing management actions', () => {
  mockManage = false;
  render(<DataModelFields model={model} />);
  expect(screen.queryByRole('button', { name: 'Add field' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Add relation' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Edit Title' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'View Title' }));
  expect(screen.getByText('Field details')).toBeTruthy();
  expect(screen.getByText('API name')).toBeTruthy();
});
