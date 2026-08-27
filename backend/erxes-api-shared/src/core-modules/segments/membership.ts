import {
  SegmentApplyMembershipResult,
  SegmentMembershipTransition,
} from './types';

/**
 * Writes settled segment membership onto a plugin's own records.
 *
 * Membership lives on the record, in the `segmentIds` array every schema gets
 * from `schemaWrapper`. Only the plugin that owns the collection runs this, so
 * the segmentation worker never writes into another service's data - it hands
 * over the decision and the owner applies it.
 *
 * The whole fan-out of one event arrives in a single call: one record can be
 * settled against dozens of segments at once, and they all land in one bulk
 * write rather than one round trip each.
 */

/** The slice of a Mongoose model this needs, so a caller can pass any model. */
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

/** Who, among the records about to be written, is already a member of what. */
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

/** Only the records that changed side; the rest were already where they belong. */
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
  }: {
    contentType: string;
    updates: SegmentMembershipUpdate[];
    forget?: string[];
  },
): Promise<SegmentApplyMembershipResult> => {
  const collection = collections[contentType];

  if (!collection) {
    return { counts: {}, unsupported: [contentType] };
  }

  // Read before the write, so the answer to "who actually moved" is the state
  // the write is about to change rather than the one it left behind. A record
  // already in the segment has not joined it again.
  const before = await membershipBefore(collection, updates);

  // Stripping a segment runs first - ordered, so a rebuild clears the old
  // answer before writing the new one rather than racing it. Only the current
  // members are touched, since the filter is the membership itself.
  //
  // A record whose last segment was stripped this way keeps an empty array
  // rather than losing the field, because naming those ids would mean holding
  // the whole membership in memory. The next apply that touches the record
  // clears it.
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

    // Narrowing on the membership itself means the write only touches records
    // that really are members, instead of every id that failed the segment.
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

  if (!operations.length) {
    return { counts: {} };
  }

  // A record that just lost its last segment would otherwise keep an empty
  // array, which the sparse membership index still has to carry. Dropping the
  // field keeps the index to actual members. Bounded by the ids just touched,
  // so this is an id lookup rather than a scan, and it runs last so it cannot
  // undo an add made for another segment in the same batch.
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

  const counts: Record<string, number> = {};

  // Counted from the collection, not from the delta: an incremented number
  // drifts the moment one apply is lost or replayed, and the membership index
  // makes an exact count cheap.
  await Promise.all(
    updates.map(async ({ segmentId }) => {
      counts[segmentId] = await collection.countDocuments({
        segmentIds: segmentId,
      });
    }),
  );

  return { counts, transitions: transitionsFrom(updates, before) };
};
