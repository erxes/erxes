import {
  carryDataExtensionValues,
  IDataExtensionOwnerContext,
  linkDataExtensionRecords,
  purgeDataExtensionValues,
  searchDataExtensionRecords,
} from './owner';
import { IDataExtensionField } from './types';


describe('carryDataExtensionValues', () => {
  it('moves values off the merged-away records before setting them on the survivor', async () => {
    const calls: string[] = [];
    const collection = {
      updateMany: jest.fn(async (filter: unknown, update: unknown) => {
        calls.push(`unset ${JSON.stringify(filter)} ${JSON.stringify(update)}`);
      }),
      updateOne: jest.fn(async (filter: unknown, update: unknown) => {
        calls.push(`set ${JSON.stringify(filter)} ${JSON.stringify(update)}`);
      }),
    };

    await carryDataExtensionValues(
      { collection } as never,
      'survivor',
      [
        { _id: 'a', dataExtensions: { tier: 'gold', primaryContact: 'c1' } },
        { _id: 'b', dataExtensions: { tier: 'silver' } },
      ],
    );

    expect(calls).toEqual([
      'unset {"_id":{"$in":["a","b"]}} {"$unset":{"dataExtensions":""}}',
      'set {"_id":"survivor"} {"$set":{"dataExtensions.tier":"silver","dataExtensions.primaryContact":"c1"}}',
    ]);
  });

  it('does nothing when no merged record has values', async () => {
    const collection = { updateMany: jest.fn(), updateOne: jest.fn() };

    await carryDataExtensionValues({ collection } as never, 'survivor', [{ _id: 'a' }]);

    expect(collection.updateMany).not.toHaveBeenCalled();
    expect(collection.updateOne).not.toHaveBeenCalled();
  });
});

const relationField = (
  kind: 'manyToOne' | 'oneToOne' | 'manyToMany',
): IDataExtensionField => ({
  recordType: 'operation:team',
  key: 'project',
  label: 'Project',
  type: 'relation',
  relation: { targetRecordType: 'operation:project', kind, side: 'source' },
  order: 0,
  status: 'active',
});

const TEAM_A = '507f1f77bcf86cd799439011';
const TEAM_B = '507f1f77bcf86cd799439012';

const ownerContext = (fields: IDataExtensionField[], linkedIds: string[]) => {
  const updates: { filter: unknown; update: unknown }[] = [];
  const finds: unknown[] = [];
  const collection = {
    collectionName: 'operation_teams',
    createIndex: jest.fn(async () => 'ok'),
    countDocuments: jest.fn(async () => 0),
    updateMany: jest.fn(async (filter: unknown, update: unknown) => {
      updates.push({ filter, update });
    }),
    find: jest.fn((filter: unknown) => {
      finds.push(filter);
      return {
        toArray: async () => linkedIds.map((_id) => ({ _id, name: `Team ${_id}` })),
      };
    }),
  };
  const context = {
    metadata: {
      DataExtensionFields: {
        db: { name: 'tenant_db' },
        find: () => ({ sort: () => ({ lean: async () => fields }) }),
      },
    },
    adapters: {
      'operation:teams': {
        storage: 'operation:teams',
        model: { db: { name: 'tenant_db' }, collection },
      },
    },
  } as unknown as IDataExtensionOwnerContext;

  return { context, updates, finds, collection };
};

describe('linkDataExtensionRecords', () => {
  it('sets one target on many records for a belongs-to link', async () => {
    const { context, updates } = ownerContext([relationField('manyToOne')], [TEAM_A, TEAM_B]);
    const result = await linkDataExtensionRecords(
      context,
      'operation',
      'operation:team',
      'project',
      [TEAM_A, TEAM_B],
      'project-1',
      'add',
    );

    expect(result.ids).toEqual([TEAM_A, TEAM_B]);
    expect(updates[0].update).toEqual({ $set: { 'dataExtensions.project': 'project-1' } });
  });

  it('only clears links that still point at the target', async () => {
    const { context, updates } = ownerContext([relationField('manyToOne')], [TEAM_A]);

    await linkDataExtensionRecords(
      context,
      'operation',
      'operation:team',
      'project',
      [TEAM_A],
      'project-1',
      'remove',
    );

    expect(updates[0].filter).toMatchObject({ 'dataExtensions.project': 'project-1' });
    expect(updates[0].update).toEqual({ $unset: { 'dataExtensions.project': '' } });
  });

  it('adds to and pulls from many-to-many lists without replacing them', async () => {
    const { context, updates } = ownerContext([relationField('manyToMany')], [TEAM_A]);

    await linkDataExtensionRecords(context, 'operation', 'operation:team', 'project', [TEAM_A], 'p1', 'add');
    await linkDataExtensionRecords(context, 'operation', 'operation:team', 'project', [TEAM_A], 'p1', 'remove');

    expect(updates[0].update).toEqual({ $addToSet: { 'dataExtensions.project': 'p1' } });
    expect(updates[0].filter).toMatchObject({
      'dataExtensions.project.99': { $exists: false },
    });
    expect(updates[1].update).toEqual({ $pull: { 'dataExtensions.project': 'p1' } });
  });

  it('refuses several records on a one-to-one link and unknown relations', async () => {
    const { context } = ownerContext([relationField('oneToOne')], []);

    await expect(
      linkDataExtensionRecords(context, 'operation', 'operation:team', 'project', [TEAM_A, TEAM_B], 'p1', 'add'),
    ).rejects.toThrow('one-to-one');
    await expect(
      linkDataExtensionRecords(context, 'operation', 'operation:team', 'other', [TEAM_A], 'p1', 'add'),
    ).rejects.toThrow('Unknown relation');
  });
});

describe('searchDataExtensionRecords', () => {
  it('matches the search paths case-insensitively with escaped input', async () => {
    const { context, finds } = ownerContext([], [TEAM_A]);
    const records = await searchDataExtensionRecords(
      context,
      'operation',
      'operation:team',
      'Ops (EU)',
      500,
    );

    expect(records.map((record) => record._id)).toEqual([TEAM_A]);
    expect(finds[0]).toEqual({ $or: [{ name: /Ops \(EU\)/i }] });
  });

  it('lists newest records without a search value', async () => {
    const { context, finds, collection } = ownerContext([], []);

    await searchDataExtensionRecords(context, 'operation', 'operation:team');

    expect(finds[0]).toEqual({});
    expect(collection.find.mock.calls[0][1]).toMatchObject({ sort: { _id: -1 }, limit: 20 });
  });
});

describe('purgeDataExtensionValues', () => {
  it('removes the values and relation indexes of a field no longer active', async () => {
    const { context, updates, collection } = ownerContext([], []);
    const dropped: string[] = [];

    Object.assign(collection, {
      updateMany: jest.fn(async (filter: unknown, update: unknown) => {
        updates.push({ filter, update });
        return { modifiedCount: 3 };
      }),
      indexes: jest.fn(async () => [
        { name: '_id_' },
        { name: 'dataExtensions_project' },
        { name: 'dataExtensions_other' },
      ]),
      dropIndex: jest.fn(async (name: string) => dropped.push(name)),
    });

    const result = await purgeDataExtensionValues(context, 'operation', 'operation:team', [
      'project',
    ]);

    expect(result).toEqual({ records: 3 });
    // The whole storage, not just records in the scope or base filter.
    expect(updates[0]).toEqual({
      filter: { $or: [{ 'dataExtensions.project': { $exists: true } }] },
      update: { $unset: { 'dataExtensions.project': '' } },
    });
    expect(dropped).toEqual(['dataExtensions_project']);
  });

  it('refuses to remove values of an active field', async () => {
    const { context, updates } = ownerContext([relationField('manyToOne')], []);

    await expect(
      purgeDataExtensionValues(context, 'operation', 'operation:team', ['project']),
    ).rejects.toThrow('Archive project');
    expect(updates).toEqual([]);
  });
});
