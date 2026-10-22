import './routerEnvironment';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren, ComponentProps } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataModelDetail } from '../components/DataModelDetail';
import { DATA_MODEL_DETAIL } from '../graphql';
import type { DataModel } from '../types';
import { model } from './fixtures';

const mockPermissions = new Set<string>();

jest.mock('../components/DataModelFields', () => ({
  DataModelFields: () => <div>Model fields editor</div>,
}));
jest.mock('../components/DataModelRecords', () => ({
  DataModelRecords: () => <div>Custom record table</div>,
}));
jest.mock('../components/DataModelSettings', () => ({
  DataModelSettings: ({ model: definition }: { model: DataModel }) => (
    <div>Object settings editor · version {definition.version}</div>
  ),
}));
jest.mock('../components/DataModelLifecycle', () => ({
  DataModelLifecycle: () => <div role="dialog">Lifecycle confirmation</div>,
}));

jest.mock('ui-modules', () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Can: ({
      action,
      children,
      fallback,
    }: PropsWithChildren<{ action: string; fallback?: React.ReactNode }>) =>
      mockPermissions.has(action) ? children : fallback ?? null,
    PageHeader: Object.assign(Container, { Start: Container, End: Container }),
  };
});

jest.mock('erxes-ui', () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Table = ({ children }: PropsWithChildren) => <table>{children}</table>;
  return {
    Badge: Container,
    IconComponent: () => null,
    PageContainer: Container,
    ScrollArea: Container,
    Skeleton: Container,
    Button: ({
      children,
      onClick,
      disabled,
      asChild,
    }: ComponentProps<'button'> & { asChild?: boolean }) =>
      asChild ? (
        children
      ) : (
        <button onClick={onClick} disabled={disabled}>
          {children}
        </button>
      ),
    Tabs: Object.assign(Container, {
      List: Container,
      Trigger: Container,
      Content: Container,
    }),
    Table: Object.assign(Table, {
      Header: ({ children }: PropsWithChildren) => <thead>{children}</thead>,
      Body: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
      Row: ({ children }: PropsWithChildren) => <tr>{children}</tr>,
      Head: ({ children }: PropsWithChildren) => <th>{children}</th>,
      Cell: ({ children }: PropsWithChildren) => <td>{children}</td>,
    }),
  };
});

const show = (definition: DataModel, next?: DataModel) =>
  render(
    <MockedProvider
      addTypename={false}
      mocks={[definition, ...(next ? [next] : [])].map((entry) => ({
        request: { query: DATA_MODEL_DETAIL, variables: { _id: entry._id } },
        result: { data: { dataModelDetail: entry } },
      }))}
    >
      <MemoryRouter
        initialEntries={[`/settings/data-models/${definition._id}`]}
      >
        <Routes>
          <Route
            path="/settings/data-models/:modelId"
            element={<DataModelDetail />}
          />
        </Routes>
      </MemoryRouter>
    </MockedProvider>,
  );

beforeEach(() => {
  mockPermissions.clear();
  ['dataModelsManage', 'dataModelRecordsRead'].forEach((permission) =>
    mockPermissions.add(permission),
  );
});

it('keeps built-ins protected even when the user has model-management permission', async () => {
  show({ ...model, source: 'BUILTIN', recordFieldTypes: [] });
  await screen.findByText('Model fields editor');
  expect(screen.getByText('Object settings editor · version 1')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Edit model' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Archive' })).toBeNull();
  expect(screen.queryByText('Custom record table')).toBeNull();
});

it('hides management and record access without their separate permissions', async () => {
  mockPermissions.clear();
  show(model);
  await screen.findByText('Model fields editor');
  expect(screen.queryByRole('button', { name: 'Edit model' })).toBeNull();
  expect(screen.queryByText('Custom record table')).toBeNull();
  expect(
    screen.getByText(
      'You do not have permission to read custom model records.',
    ),
  ).toBeTruthy();
});

it('requires restoration before opening archived model records or fields', async () => {
  show({ ...model, archivedAt: '2026-10-22T00:00:00Z' });
  await screen.findByRole('button', { name: 'Restore' });
  expect(screen.queryByText('Model fields editor')).toBeNull();
  expect(screen.queryByText('Custom record table')).toBeNull();
});
