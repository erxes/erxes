import { useApolloClient, useQuery } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import type { PropsWithChildren } from 'react';
import { DATA_MODEL_FIELDS } from '../graphql';
import { useDataModelFields, useDataModelMutation } from '../hooks';
import { createRecordDocuments } from '../recordDocuments';
import { field, model, record } from './fixtures';

jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
const wrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: PropsWithChildren) =>
    <MockedProvider mocks={mocks}>{children}</MockedProvider>;

it('loads Data Models-owned fields without a Properties permission or query', async () => {
  const { result } = renderHook(() => useDataModelFields(model._id), {
    wrapper: wrapper([
      {
        request: {
          query: DATA_MODEL_FIELDS,
          variables: { dataModelId: model._id, archived: false },
        },
        result: {
          data: {
            dataModelFieldList: [{ ...field(), __typename: 'DataModelField' }],
          },
        },
      },
    ]),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.fields[0].label).toBe('Title');
});

it('keeps loaded field editors mounted while metadata refetches in the background', async () => {
  const response = {
    request: {
      query: DATA_MODEL_FIELDS,
      variables: { dataModelId: model._id, archived: false },
    },
    result: { data: { dataModelFieldList: [field()] } },
  };
  const { result } = renderHook(
    () => ({
      fields: useDataModelFields(model._id),
      client: useApolloClient(),
    }),
    {
      wrapper: wrapper([response, { ...response, delay: 50 }]),
    },
  );
  await waitFor(() => expect(result.current.fields.fields).toHaveLength(1));
  let pending: Promise<unknown>;
  act(() => {
    pending = result.current.client.refetchQueries({
      include: ['dataModelsUiFields'],
    });
  });
  expect(result.current.fields.loading).toBe(false);
  expect(result.current.fields.fields).toHaveLength(1);
  await act(async () => {
    await pending;
  });
});

it('refetches the active typed record list before completing a mutation', async () => {
  const fields = [field()];
  const documents = createRecordDocuments(model, fields);
  const listVariables = { limit: 25, offset: 0, deleted: false };
  const variables = {
    _id: record._id,
    expectedVersion: 7,
    input: { title: 'Updated' },
  };
  const wire = { ...record, __typename: 'DataModel_asset', title: 'Old' };
  const updated = { ...wire, title: 'Updated', version: 8 };
  const { result } = renderHook(
    () => {
      const query = useQuery<{
        dataModelRecordList: { list: { title: string }[] };
      }>(documents.list, { variables: listVariables });
      const mutation = useDataModelMutation(documents.update, 'Saved');
      return { query, mutation };
    },
    {
      wrapper: wrapper([
        {
          request: { query: documents.list, variables: listVariables },
          result: {
            data: {
              dataModelRecordList: {
                __typename: 'DataModel_assetList',
                list: [wire],
                totalCount: 1,
              },
            },
          },
        },
        {
          request: { query: documents.update, variables },
          result: { data: { dataModelRecordUpdate: updated } },
        },
        {
          request: { query: documents.list, variables: listVariables },
          result: {
            data: {
              dataModelRecordList: {
                __typename: 'DataModel_assetList',
                list: [updated],
                totalCount: 1,
              },
            },
          },
        },
      ]),
    },
  );
  await waitFor(() => expect(result.current.query.loading).toBe(false));
  await act(async () => {
    await result.current.mutation[0]({ variables });
  });
  expect(result.current.query.data?.dataModelRecordList.list[0].title).toBe(
    'Updated',
  );
});

it('returns no successful data on an optimistic concurrency conflict', async () => {
  const documents = createRecordDocuments(model, [field()]);
  const variables = {
    _id: record._id,
    expectedVersion: 7,
    input: { title: 'Changed' },
  };
  const { result } = renderHook(
    () => useDataModelMutation(documents.update, 'Saved'),
    {
      wrapper: wrapper([
        {
          request: { query: documents.update, variables },
          result: {
            errors: [
              new GraphQLError('Record changed; reload it before saving'),
            ],
          },
        },
      ]),
    },
  );
  await act(async () => {
    const response = await result.current[0]({ variables });
    expect(response.data).toBeUndefined();
  });
  expect(result.current[1].error?.message).toContain('Record changed');
});

it('reports a committed write as successful even when its follow-up list refresh fails', async () => {
  const documents = createRecordDocuments(model, [field()]);
  const listVariables = { limit: 25, offset: 0, deleted: false };
  const variables = { input: { title: 'Saved' } };
  const { result } = renderHook(
    () => ({
      query: useQuery(documents.list, { variables: listVariables }),
      mutation: useDataModelMutation(documents.create, 'Saved'),
    }),
    {
      wrapper: wrapper([
        {
          request: { query: documents.list, variables: listVariables },
          result: {
            data: { dataModelRecordList: { list: [], totalCount: 0 } },
          },
        },
        {
          request: { query: documents.create, variables },
          result: {
            data: {
              dataModelRecordCreate: { _id: 'saved-record', version: 1 },
            },
          },
        },
        {
          request: { query: documents.list, variables: listVariables },
          error: new Error('List temporarily unavailable'),
        },
      ]),
    },
  );
  await waitFor(() => expect(result.current.query.loading).toBe(false));
  await act(async () => {
    const response = await result.current.mutation[0]({ variables });
    expect(response.data).toBeTruthy();
  });
  expect(result.current.mutation[1].error).toBeUndefined();
  expect(result.current.query.error?.message).toContain(
    'List temporarily unavailable',
  );
});
