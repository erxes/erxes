import type { Model } from 'mongoose';
import { watchItem } from '../modules/sales/utils';

jest.mock('erxes-api-shared/utils', () => ({}));
jest.mock('../modules/sales/graphql/resolvers/queries/deals', () => ({}));

type WatchedRecord = { _id: string; watchedUserIds?: string[] | null };
type WatchFilter = { _id: string; watchedUserIds?: null };
type WatchUpdate = {
  $set?: { watchedUserIds: string[] };
  $addToSet?: { watchedUserIds: string };
  $pull?: { watchedUserIds: string };
};

// Snapshot reads and indivisible writes let concurrent calls expose lost
// updates without depending on a database server in the unit-test runner.
const createCollection = (initial: WatchedRecord | null) => {
  const stored = initial && structuredClone(initial);
  const read = () => stored && structuredClone(stored);
  const write = (filter: WatchFilter, update: WatchUpdate) => {
    if (!stored) return;
    if ('watchedUserIds' in filter && stored.watchedUserIds != null) return;
    if (update.$set) stored.watchedUserIds = [...update.$set.watchedUserIds];
    if (update.$addToSet) {
      stored.watchedUserIds = [
        ...new Set([
          ...(stored.watchedUserIds || []),
          update.$addToSet.watchedUserIds,
        ]),
      ];
    }
    if (update.$pull) {
      stored.watchedUserIds = stored.watchedUserIds?.filter(
        (id) => id !== update.$pull?.watchedUserIds,
      );
    }
  };
  const collection = {
    findOne: jest.fn(async () => read()),
    updateOne: jest.fn(async (filter: WatchFilter, update: WatchUpdate) => {
      write(filter, update);
    }),
    findOneAndUpdate: jest.fn(
      async (filter: WatchFilter, update: WatchUpdate) => {
        write(filter, update);
        return read();
      },
    ),
  };
  return {
    collection: collection as unknown as Model<WatchedRecord>,
    read,
    failWrite: () => {
      collection.updateOne.mockRejectedValueOnce(new Error('Write failed'));
      collection.findOneAndUpdate.mockRejectedValueOnce(
        new Error('Write failed'),
      );
    },
  };
};

it('preserves both users when concurrent watch requests read the same record', async () => {
  const { collection, read } = createCollection({
    _id: 'item',
    watchedUserIds: ['owner'],
  });
  await Promise.all([
    watchItem(collection, 'item', true, 'alice'),
    watchItem(collection, 'item', true, 'bob'),
  ]);
  expect(read()?.watchedUserIds?.sort()).toEqual(['alice', 'bob', 'owner']);
});

it('keeps another user added concurrently with an unwatch', async () => {
  const { collection, read } = createCollection({
    _id: 'item',
    watchedUserIds: ['alice'],
  });
  await Promise.all([
    watchItem(collection, 'item', true, 'bob'),
    watchItem(collection, 'item', false, 'alice'),
  ]);
  expect(read()?.watchedUserIds).toEqual(['bob']);
});

it('does not duplicate a watcher on repeated requests', async () => {
  const { collection, read } = createCollection({ _id: 'item' });
  await watchItem(collection, 'item', true, 'alice');
  const result = await watchItem(collection, 'item', true, 'alice');
  expect(result).toEqual({ _id: 'item', watchedUserIds: ['alice'] });
  expect(read()).toEqual(result);
});

it('does not remove another watcher when the user is already absent', async () => {
  const { collection, read } = createCollection({
    _id: 'item',
    watchedUserIds: ['bob'],
  });
  await watchItem(collection, 'item', false, 'alice');
  await watchItem(collection, 'item', false, 'alice');
  expect(read()?.watchedUserIds).toEqual(['bob']);
});

it.each([true, false])(
  'handles a legacy null watcher list for isAdd=%s',
  async (isAdd) => {
    const { collection } = createCollection({
      _id: 'item',
      watchedUserIds: null,
    });
    await expect(
      watchItem(collection, 'item', isAdd, 'alice'),
    ).resolves.toEqual({
      _id: 'item',
      watchedUserIds: isAdd ? ['alice'] : [],
    });
  },
);

it('returns null for a missing record without creating one', async () => {
  const { collection, read } = createCollection(null);
  await expect(
    watchItem(collection, 'missing', true, 'alice'),
  ).resolves.toBeNull();
  expect(read()).toBeNull();
});

it('propagates write failures without changing the record', async () => {
  const { collection, read, failWrite } = createCollection({
    _id: 'item',
    watchedUserIds: ['bob'],
  });
  failWrite();
  await expect(watchItem(collection, 'item', true, 'alice')).rejects.toThrow(
    'Write failed',
  );
  expect(read()?.watchedUserIds).toEqual(['bob']);
});
