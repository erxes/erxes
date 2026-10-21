/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import type { PropsWithChildren } from 'react';
import { toast } from 'erxes-ui';
import { EMAIL_TEMPLATE_PICKER_QUERY } from '../../graphql/queries';
import type { EmailTemplate } from '../../types';
import { useEmailTemplatePicker } from '../useEmailTemplatePicker';

jest.mock('erxes-ui', () => ({ toast: jest.fn() }));

const legacy: EmailTemplate = {
  _id: 'legacy',
  name: 'Legacy',
  content: '<p>Hello</p>',
};
const maily: EmailTemplate = {
  _id: 'maily',
  name: 'Maily',
  contentJson: { type: 'doc' },
};
const page = (
  list: EmailTemplate[],
  hasNextPage = false,
  endCursor = 'last',
) => ({
  emailTemplates: {
    list: list.map((template) => ({
      description: null,
      content: null,
      contentJson: null,
      contentFormat: null,
      ...template,
    })),
    pageInfo: { hasNextPage, endCursor },
  },
});
const wrapper = (mocks: MockedResponse[]) =>
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  };

it('filters legacy and maily templates and appends later pages without duplicates', async () => {
  const mocks: MockedResponse[] = [
    {
      request: { query: EMAIL_TEMPLATE_PICKER_QUERY, variables: {} },
      result: { data: page([legacy, maily], true, 'next') },
    },
    {
      request: {
        query: EMAIL_TEMPLATE_PICKER_QUERY,
        variables: { cursor: 'next' },
      },
      result: { data: page([legacy, { ...legacy, _id: 'second' }]) },
    },
  ];
  const { result } = renderHook(
    () =>
      useEmailTemplatePicker({ format: 'blocks', onSelect: () => undefined }),
    { wrapper: wrapper(mocks) },
  );
  act(() => result.current.setOpen(true));
  await waitFor(() =>
    expect(result.current.templates.map(({ _id }) => _id)).toEqual(['legacy']),
  );
  act(() => result.current.loadMore());
  await waitFor(() =>
    expect(result.current.templates.map(({ _id }) => _id)).toEqual([
      'legacy',
      'second',
    ]),
  );
  expect(result.current.hasNextPage).toBe(false);
});

it('keeps the picker open on selection failure and closes after successful selection', async () => {
  const onSelect = jest
    .fn<Promise<void>, [EmailTemplate]>()
    .mockRejectedValueOnce(new Error('Unable to insert'))
    .mockResolvedValueOnce(undefined);
  const { result } = renderHook(() => useEmailTemplatePicker({ onSelect }), {
    wrapper: wrapper([
      {
        request: { query: EMAIL_TEMPLATE_PICKER_QUERY, variables: {} },
        result: { data: page([legacy]) },
      },
    ]),
  });
  act(() => result.current.setOpen(true));
  await waitFor(() => expect(result.current.templates).toHaveLength(1));
  await act(async () => result.current.select(legacy));
  expect(result.current.open).toBe(true);
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({
      description: 'Unable to insert',
      variant: 'destructive',
    }),
  );
  await act(async () => result.current.select(legacy));
  expect(result.current.open).toBe(false);
  expect(result.current.applying).toBe(false);
});
