import { SegmentRelationMeta } from './relationRegistry';

const plugins: Record<string, SegmentRelationMeta[]> = {
  core: [
    {
      key: 'user.customers',
      label: 'Owned customers',
      subjectType: 'core:organization.users',
      relatedType: 'core:contacts.customers',
      join: { via: 'field', on: 'related', path: 'ownerId' },
    },
    {
      key: 'customer.deals',
      label: 'Deals',
      subjectType: 'core:contacts.customers',
      relatedType: 'sales:sales.deals',
      join: {
        via: 'relation',
        subjectRecordType: 'core:customer',
        relatedRecordType: 'sales:deal',
      },
    },
  ],
};

jest.mock('../../utils', () => ({
  getPlugins: async () => Object.keys(plugins),
  getPlugin: async (name: string) => ({
    config: { meta: { segments: { segmentRelations: plugins[name] } } },
  }),
}));

const { segmentJoinChanges } = require('./joinChanges');
const { gatherSegmentJoinPaths } = require('./relationRegistry');

describe('gatherSegmentJoinPaths', () => {
  it('files the path under whichever document carries it', async () => {
    const paths = await gatherSegmentJoinPaths();

    expect(paths.get('core:contacts.customers')).toEqual(['ownerId']);
  });

  it('leaves relation-record joins out - they have a row of their own', async () => {
    const paths = await gatherSegmentJoinPaths();

    expect(paths.has('sales:sales.deals')).toBe(false);
  });
});

describe('segmentJoinChanges', () => {
  it('reports both owners when one replaces the other', async () => {
    const changes = await segmentJoinChanges('core:contacts.customers', {
      updated: { ownerId: { prev: 'user_a', current: 'user_b' } },
    });

    expect(changes).toEqual({ ownerId: { prev: 'user_a', next: 'user_b' } });
  });

  it('reports the old owner when the field is cleared', async () => {
    const changes = await segmentJoinChanges('core:contacts.customers', {
      removed: { ownerId: 'user_a' },
    });

    expect(changes).toEqual({ ownerId: { prev: 'user_a', next: undefined } });
  });

  it('reports the new owner on a record that had none', async () => {
    const changes = await segmentJoinChanges('core:contacts.customers', {
      added: { ownerId: 'user_b' },
    });

    expect(changes).toEqual({ ownerId: { prev: undefined, next: 'user_b' } });
  });

  it('costs nothing when no join path moved', async () => {
    const changes = await segmentJoinChanges('core:contacts.customers', {
      updated: { primaryEmail: { prev: 'a@x.mn', current: 'b@x.mn' } },
    });

    expect(changes).toBeUndefined();
  });

  it('ignores a collection nothing joins by', async () => {
    expect(
      await segmentJoinChanges('sales:sales.deals', {
        updated: { ownerId: { prev: 'user_a', current: 'user_b' } },
      }),
    ).toBeUndefined();
  });

  it('has nothing to report when the write carried no diff', async () => {
    expect(
      await segmentJoinChanges('core:contacts.customers', undefined),
    ).toBeUndefined();
  });
  it('reaches the owner of a record created without a diff', async () => {
    const changes = await segmentJoinChanges(
      'core:contacts.customers',
      undefined,
      { current: [{ _id: 'c1', ownerId: 'user_a' }] },
    );

    expect(changes).toEqual({ ownerId: { prev: undefined, next: ['user_a'] } });
  });

  it('reaches the owner when another field moved', async () => {
    const changes = await segmentJoinChanges(
      'core:contacts.customers',
      { updated: { primaryEmail: { prev: 'a@x.mn', current: 'b@x.mn' } } },
      {
        prev: [{ _id: 'c1', ownerId: 'user_a' }],
        current: [{ _id: 'c1', ownerId: 'user_a' }],
      },
    );

    expect(changes).toEqual({
      ownerId: { prev: ['user_a'], next: ['user_a'] },
    });
  });

  it('reaches both owners when the documents say it moved', async () => {
    const changes = await segmentJoinChanges(
      'core:contacts.customers',
      { updated: { ownerId: { prev: 'user_a', current: 'user_b' } } },
      { current: [{ _id: 'c1', ownerId: 'user_b' }] },
    );

    expect(changes).toEqual({ ownerId: { prev: 'user_a', next: ['user_b'] } });
  });

  it('reaches the owner of a deleted record', async () => {
    const changes = await segmentJoinChanges(
      'core:contacts.customers',
      undefined,
      { prev: [{ _id: 'c1', ownerId: 'user_a' }] },
    );

    expect(changes).toEqual({ ownerId: { prev: ['user_a'], next: undefined } });
  });

  it('collects every owner of a batch', async () => {
    const changes = await segmentJoinChanges(
      'core:contacts.customers',
      undefined,
      {
        current: [
          { _id: 'c1', ownerId: 'user_a' },
          { _id: 'c2' },
          { _id: 'c3', ownerId: 'user_b' },
        ],
      },
    );

    expect(changes).toEqual({
      ownerId: { prev: undefined, next: ['user_a', 'user_b'] },
    });
  });
});
