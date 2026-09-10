import {
  SegmentApplyMembershipResult,
  SegmentMembershipTransition,
} from './types';

export type SegmentMembershipCollection = {
  bulkWrite: (operations: Record<string, unknown>[]) => Promise<unknown>;
  countDocuments: (filter: Record<string, unknown>) => Promise<number>;
  find: (
    filter: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => { lean: () => Promise<{ _id: string; segmentIds?: string[] }[]> };
};

export type SegmentMembershipUpdate = {
  segmentId: string;
  matched: string[];
  notMatched: string[];
};

const membershipBefore = async (
  collection: SegmentMembershipCollection,
  updates: SegmentMembershipUpdate[],
): Promise<Map<string, Set<string>>> => {
  const touched = [
    ...new Set(updates.flatMap((u) => [...u.matched, ...u.notMatched])),
  ];

  const segmentIds = updates.map((update) => update.segmentId);

  if (!touched.length || !segmentIds.length) {
    return new Map();
  }

  const records = await collection
    .find(
      { _id: { $in: touched }, segmentIds: { $in: segmentIds } },
      { _id: 1, segmentIds: 1 },
    )
    .lean();

  return new Map(
    records.map((record) => [
      String(record._id),
      new Set(record.segmentIds || []),
    ]),
  );
};

const transitionsFrom = (
  updates: SegmentMembershipUpdate[],
  before: Map<string, Set<string>>,
): SegmentMembershipTransition[] =>
  updates
    .map(({ segmentId, matched, notMatched }) => ({
      segmentId,
      joined: matched.filter((id) => !before.get(id)?.has(segmentId)),
      left: notMatched.filter((id) => before.get(id)?.has(segmentId)),
    }))
    .filter(({ joined, left }) => joined.length || left.length);

export const applySegmentMembership = async (
  collections: Record<string, SegmentMembershipCollection>,
  {
    contentType,
    updates,
    forget,
    countFor,
    transitions,
  }: {
    contentType: string;
    updates: SegmentMembershipUpdate[];
    forget?: string[];
    countFor?: string[];
    transitions?: boolean;
  },
): Promise<SegmentApplyMembershipResult> => {
  const collection = collections[contentType];

  if (!collection) {
    return { counts: {}, unsupported: [contentType] };
  }

  const wantsTransitions = transitions !== false;

  const before = wantsTransitions
    ? await membershipBefore(collection, updates)
    : new Map<string, Set<string>>();

  const operations: Record<string, unknown>[] = (forget || []).map(
    (segmentId) => ({
      updateMany: {
        filter: { segmentIds: segmentId },
        update: { $pull: { segmentIds: segmentId } },
      },
    }),
  );

  for (const update of updates) {
    if (update.matched.length) {
      operations.push({
        updateMany: {
          filter: { _id: { $in: update.matched } },
          update: { $addToSet: { segmentIds: update.segmentId } },
        },
      });
    }

    if (update.notMatched.length) {
      operations.push({
        updateMany: {
          filter: {
            _id: { $in: update.notMatched },
            segmentIds: update.segmentId,
          },
          update: { $pull: { segmentIds: update.segmentId } },
        },
      });
    }
  }

  const counting = countFor ?? updates.map((update) => update.segmentId);

  let countedAt: string | undefined;

  const countMembers = async (): Promise<Record<string, number>> => {
    const counts: Record<string, number> = {};

    await Promise.all(
      counting.map(async (segmentId) => {
        counts[segmentId] = await collection.countDocuments({
          segmentIds: segmentId,
        });
      }),
    );

    countedAt = new Date().toISOString();

    return counts;
  };

  if (!operations.length) {
    const counts = counting.length ? await countMembers() : {};

    return { counts, countedAt };
  }

  const cleared = [...new Set(updates.flatMap((update) => update.notMatched))];

  if (cleared.length) {
    operations.push({
      updateMany: {
        filter: { _id: { $in: cleared }, segmentIds: { $size: 0 } },
        update: { $unset: { segmentIds: '' } },
      },
    });
  }

  await collection.bulkWrite(operations);

  const counts = counting.length ? await countMembers() : {};

  return {
    counts,
    countedAt,
    ...(wantsTransitions
      ? { transitions: transitionsFrom(updates, before) }
      : {}),
  };
};
