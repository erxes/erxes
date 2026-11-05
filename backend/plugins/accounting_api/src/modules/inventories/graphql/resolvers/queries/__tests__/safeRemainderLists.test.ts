import sift from 'sift';
import { IContext } from '~/connectionResolvers';
import safeRemainderQueries from '../safeRemainders';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  paginate: (query: { rows: object[] }) => query.rows,
}));

const remainders = [
  { _id: 'draft-count', status: 'draft', branchId: 'ub' },
  { _id: 'done-count', status: 'done', branchId: 'ub' },
  { _id: 'posted-count', status: 'published', branchId: 'ub' },
  { _id: 'other-branch', status: 'draft', branchId: 'darkhan' },
];

const buildContext = (checkPermission = jest.fn(() => Promise.resolve())) => {
  const find = jest.fn((query: object) => {
    const rows = remainders.filter(sift(query));
    return {
      rows,
      sort: () => ({ rows }),
      countDocuments: () => Promise.resolve(rows.length),
    };
  });
  return {
    context: {
      models: { SafeRemainders: { find } },
      checkPermission,
    } as unknown as IContext,
    find,
  };
};

const listIds = async (params: object) => {
  const result = await safeRemainderQueries.safeRemainders(
    undefined,
    params,
    buildContext().context,
  );
  return {
    ids: result.remainders.map(({ _id }: { _id: string }) => _id),
    totalCount: result.totalCount,
  };
};

test('selecting several statuses lists every count in those statuses', async () => {
  await expect(listIds({ statuses: ['draft', 'done'] })).resolves.toEqual({
    ids: ['draft-count', 'done-count', 'other-branch'],
    totalCount: 3,
  });
});

test('status combines with the other filters and the total follows the same result', async () => {
  await expect(
    listIds({ statuses: ['draft'], branchId: 'darkhan' }),
  ).resolves.toEqual({ ids: ['other-branch'], totalCount: 1 });
});

test('clearing every status shows all counts', async () => {
  await expect(listIds({ statuses: [] })).resolves.toMatchObject({
    totalCount: 4,
  });
});

test('an unknown status in the URL shows an empty list', async () => {
  await expect(listIds({ statuses: ['archived'] })).resolves.toEqual({
    ids: [],
    totalCount: 0,
  });
});

test('a user without read permission cannot reach the data through the status filter', async () => {
  const { context, find } = buildContext(
    jest.fn().mockRejectedValue(new Error('Permission denied')),
  );
  await expect(
    safeRemainderQueries.safeRemainders(
      undefined,
      { statuses: ['draft'] },
      context,
    ),
  ).rejects.toThrow('Permission denied');
  expect(find).not.toHaveBeenCalled();
});
