import { act, renderHook } from '@testing-library/react';
import { useApolloClient, useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';
import { POST_EXECUTION, REMOVE_EXECUTION } from '../graphql';
import { useExecutionActions } from '../useExecutionActions';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(),
  useApolloClient: jest.fn(),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn(), useConfirm: jest.fn() }));
jest.mock('ui-modules', () => ({ usePermissionCheck: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const setup = () => {
  const post = jest.fn().mockResolvedValue({});
  const undo = jest.fn().mockResolvedValue({});
  const remove = jest.fn().mockResolvedValue({});
  const confirm = jest.fn().mockResolvedValue(undefined);
  const refetchQueries = jest.fn().mockResolvedValue([]);
  jest
    .mocked(useMutation)
    .mockImplementation(
      (doc) =>
        [
          doc === POST_EXECUTION
            ? post
            : doc === REMOVE_EXECUTION
            ? remove
            : undo,
          {},
        ] as never,
    );
  jest.mocked(useApolloClient).mockReturnValue({ refetchQueries } as never);
  jest.mocked(useConfirm).mockReturnValue({ confirm } as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  const hook = renderHook(() => useExecutionActions());
  return { ...hook, post, undo, remove, confirm, refetchQueries };
};

test('bulk deletion undoes posted rows and removes drafts without undoing them', async () => {
  const { result, undo, remove, refetchQueries, confirm } = setup();
  const processed = jest.fn();
  await act(async () =>
    result.current.run(
      'remove',
      [
        { _id: 'a', status: 'posted', parentId: 'parent' },
        { _id: 'b', status: 'draft', parentId: null },
      ],
      processed,
    ),
  );
  expect(confirm).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining('production-confirm-undo'),
    }),
  );
  expect(undo).toHaveBeenCalledTimes(1);
  expect(undo).toHaveBeenCalledWith({ variables: { _id: 'a' } });
  expect(remove.mock.calls).toEqual([
    [{ variables: { _id: 'a' } }],
    [{ variables: { _id: 'b' } }],
  ]);
  expect(processed).toHaveBeenCalledWith(['a', 'b']);
  expect(refetchQueries).toHaveBeenCalledTimes(1);
});

test('bulk failure stops subsequent writes and clears only completed selections', async () => {
  const { result, post, refetchQueries } = setup();
  post
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(new Error('Insufficient inventory'));
  const processed = jest.fn();
  await act(async () =>
    result.current.run(
      'post',
      ['a', 'b', 'c'].map((_id) => ({ _id, status: 'draft', parentId: null })),
      processed,
    ),
  );
  expect(post).toHaveBeenCalledTimes(2);
  expect(processed).toHaveBeenCalledWith(['a']);
  expect(refetchQueries).toHaveBeenCalledTimes(1);
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({
      variant: 'destructive',
      description: 'Insufficient inventory (1/3)',
    }),
  );
  expect(result.current.loading).toBe(false);
});

test('cancelled confirmation and mixed ineligible selections never write', async () => {
  const { result, post, confirm } = setup();
  await act(async () =>
    result.current.run('post', [
      { _id: 'posted', status: 'posted', parentId: 'parent' },
    ]),
  );
  expect(confirm).not.toHaveBeenCalled();
  confirm.mockRejectedValueOnce(new Error('Cancelled'));
  await act(async () =>
    result.current.run('post', [
      { _id: 'draft', status: 'draft', parentId: null },
    ]),
  );
  expect(post).not.toHaveBeenCalled();
  expect(result.current.loading).toBe(false);
});
