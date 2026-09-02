import {
  canonicalSegmentText,
  collectSegmentReferences,
  gatherSegmentFieldSources,
  gatherSegmentRelations,
  hasSegmentReferenceInRelation,
  sameSegmentDefinition,
  segmentDependencies,
  segmentDependencyKey,
  segmentDependsOnClock,
  segmentFingerprint,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISegment,
  ISegmentDocument,
  segmentSchema,
} from '../definitions/segments';

export type ISegmentCreate = Omit<
  ISegment,
  | 'revision'
  | 'createdBy'
  | 'updatedBy'
  | 'ownerId'
  | 'dependsOn'
  | 'fingerprint'
> & { ownerId?: string };

export interface ISegmentModel extends Model<ISegmentDocument> {
  getSegment(_id: string): Promise<ISegmentDocument | null>;
  createSegment(doc: ISegmentCreate, userId: string): Promise<ISegmentDocument>;
  updateSegment(
    _id: string,
    doc: Partial<ISegmentCreate>,
    userId: string,
  ): Promise<ISegmentDocument | null>;
  removeSegments(ids: string[]): Promise<{ deletedCount?: number }>;
  findSameDefinition(
    contentType: string,
    root: ISegment['root'],
    excludeId?: string,
  ): Promise<ISegmentDocument | null>;
}

const REFERENCE_PREFIX = segmentDependencyKey('');

const dependenciesOf = async (contentType: string, root: ISegment['root']) => {
  const { relations } = await gatherSegmentRelations(contentType);
  const { byField } = await gatherSegmentFieldSources();

  return segmentDependencies(contentType, root, relations, byField);
};

export const loadSegmentClass = (models: IModels) => {
  const assertReferencesResolvable = async (
    contentType: string,
    root: ISegment['root'],
    selfId?: string,
  ) => {
    const referenced = collectSegmentReferences(root);

    if (!referenced.length) {
      return;
    }

    if (selfId && referenced.includes(selfId)) {
      throw new Error('A segment cannot reference itself');
    }

    if (hasSegmentReferenceInRelation(root)) {
      throw new Error(
        'A segment can only be used as a condition on the records it is about, not inside a related-record filter',
      );
    }

    const targets = await models.Segments.find(
      { _id: { $in: referenced } },
      { _id: 1, name: 1, contentType: 1 },
    ).lean<ISegmentDocument[]>();

    const missing = referenced.filter(
      (id) => !targets.some((target) => target._id === id),
    );

    if (missing.length) {
      throw new Error(`Referenced segment no longer exists: ${missing[0]}`);
    }

    const foreign = targets.find(
      (target) => target.contentType !== contentType,
    );

    if (foreign) {
      throw new Error(
        `"${foreign.name}" is about different records, so it cannot be used as a condition here`,
      );
    }

    if (!selfId) {
      return;
    }

    const seen = new Set(referenced);
    let frontier = referenced;

    while (frontier.length) {
      const next = await models.Segments.find(
        { _id: { $in: frontier } },
        { _id: 1, name: 1, dependsOn: 1 },
      ).lean<ISegmentDocument[]>();

      const onward: string[] = [];

      for (const segment of next) {
        for (const dependency of segment.dependsOn || []) {
          if (!dependency.startsWith(REFERENCE_PREFIX)) {
            continue;
          }

          const id = dependency.slice(REFERENCE_PREFIX.length);

          if (id === selfId) {
            throw new Error(
              `"${segment.name}" already depends on this segment, so referencing it would loop`,
            );
          }

          if (!seen.has(id)) {
            seen.add(id);
            onward.push(id);
          }
        }
      }

      frontier = onward;
    }
  };

  const sameDefinition = async (
    contentType: string,
    root: ISegment['root'],
    excludeId?: string,
  ) => {
    const candidates = await models.Segments.find({
      contentType,
      fingerprint: segmentFingerprint(contentType, root),
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean<ISegmentDocument[]>();

    const text = canonicalSegmentText(contentType, root);

    return (
      candidates.find(
        (candidate) =>
          candidate.root &&
          canonicalSegmentText(contentType, candidate.root) === text,
      ) || null
    );
  };

  class Segment {
    /**
     * Returns `null` for a missing segment instead of throwing: a caller
     * resolving several segments should skip the one that is gone, not lose
     * the whole batch.
     */
    public static async getSegment(_id: string) {
      return models.Segments.findOne({ _id }).lean<ISegmentDocument>();
    }

    public static async findSameDefinition(
      contentType: string,
      root: ISegment['root'],
      excludeId?: string,
    ) {
      return sameDefinition(contentType, root, excludeId);
    }

    public static async createSegment(doc: ISegmentCreate, userId: string) {
      await assertReferencesResolvable(doc.contentType, doc.root);

      if (!doc.ownedBy && !doc.name?.trim()) {
        throw new Error('Name is required');
      }

      if (!doc.ownedBy) {
        const existing = await sameDefinition(doc.contentType, doc.root);

        if (existing) {
          throw new Error(
            `A segment with these conditions already exists: ${existing.name}`,
          );
        }
      }

      return models.Segments.create({
        ...doc,
        fingerprint: segmentFingerprint(doc.contentType, doc.root),
        dependsOn: await dependenciesOf(doc.contentType, doc.root),
        timeSensitive: segmentDependsOnClock(doc.root),
        revision: 1,
        ownerId: doc.ownerId || userId,
        createdBy: userId,
      });
    }

    public static async updateSegment(
      _id: string,
      doc: Partial<ISegmentCreate>,
      userId: string,
    ) {
      const current = await models.Segments.getSegment(_id);

      const contentType = doc.contentType || current?.contentType;

      const wasOwned = Boolean(current?.ownedBy) || !current?.name?.trim();
      const promoting = wasOwned && Boolean(doc.name?.trim());
      const stillOwned = wasOwned && !promoting;

      if (doc.root && contentType) {
        await assertReferencesResolvable(contentType, doc.root, _id);

        if (!stillOwned) {
          const existing = await sameDefinition(contentType, doc.root, _id);

          if (existing) {
            throw new Error(
              `A segment with these conditions already exists: ${existing.name}`,
            );
          }
        }
      }

      const asksSomethingElse = Boolean(
        doc.root &&
          contentType &&
          !(
            current?.root &&
            sameSegmentDefinition(contentType, doc.root, current.root)
          ),
      );

      const dependsOn =
        doc.root && contentType
          ? await dependenciesOf(contentType, doc.root)
          : undefined;

      await models.Segments.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            ...(dependsOn ? { dependsOn } : {}),
            ...(doc.root && contentType
              ? {
                  fingerprint: segmentFingerprint(contentType, doc.root),
                  timeSensitive: segmentDependsOnClock(doc.root),
                }
              : {}),
            updatedBy: userId,
          },
          ...(asksSomethingElse ? { $inc: { revision: 1 } } : {}),
          ...(promoting ? { $unset: { ownedBy: 1 } } : {}),
        },
      );

      return models.Segments.findOne({ _id }).lean<ISegmentDocument>();
    }

    public static async removeSegments(ids: string[]) {
      const dependent = await models.Segments.findOne(
        {
          _id: { $nin: ids },
          dependsOn: { $in: ids.map(segmentDependencyKey) },
        },
        { name: 1 },
      ).lean<ISegmentDocument>();

      if (dependent) {
        throw new Error(
          `"${dependent.name}" uses this segment as a condition. Remove that condition first.`,
        );
      }

      return models.Segments.deleteMany({ _id: { $in: ids } });
    }
  }

  segmentSchema.loadClass(Segment);

  return segmentSchema;
};
