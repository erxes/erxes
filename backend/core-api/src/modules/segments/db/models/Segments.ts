import {
  canonicalSegmentText,
  gatherSegmentRelations,
  segmentDependencies,
  segmentFingerprint,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISegment,
  ISegmentDocument,
  segmentSchema,
} from '../definitions/segments';

/**
 * Segments are whole documents now: the condition tree lives inside `root`, so
 * there are no child segment rows to create, cascade or leave dangling.
 */

/** What a caller supplies; the model fills in ownership and revision. */
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
  /** A segment that already asks this, if one exists. */
  findSameDefinition(
    contentType: string,
    root: ISegment['root'],
    excludeId?: string,
  ): Promise<ISegmentDocument | null>;
}

/** The content types a tree reads, resolved through the live relation registry. */
const dependenciesOf = async (contentType: string, root: ISegment['root']) => {
  const { relations } = await gatherSegmentRelations(contentType);

  return segmentDependencies(contentType, root, relations);
};

export const loadSegmentClass = (models: IModels) => {
  /**
   * The segment already answering this question, if there is one.
   *
   * The fingerprint narrows to candidates and the canonical text settles them,
   * so a hash collision costs a comparison rather than a wrong answer.
   */
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
      // Guarded here rather than only in the form: a second segment asking the
      // same question doubles every evaluation and every membership write for
      // one answer, whichever path created it.
      const existing = await sameDefinition(doc.contentType, doc.root);

      if (existing) {
        throw new Error(
          `A segment with these conditions already exists: ${existing.name}`,
        );
      }

      return models.Segments.create({
        ...doc,
        fingerprint: segmentFingerprint(doc.contentType, doc.root),
        dependsOn: await dependenciesOf(doc.contentType, doc.root),
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
      // A changed tree is a new revision, so anything caching membership by
      // revision knows to rebuild rather than serve a stale list.
      const bumpsRevision = Boolean(doc.root);

      // Recomputed with the tree, never separately: a stale `dependsOn` means
      // the worker stops being told about changes the segment now reads.
      const contentType =
        doc.contentType || (await models.Segments.getSegment(_id))?.contentType;

      if (doc.root && contentType) {
        const existing = await sameDefinition(contentType, doc.root, _id);

        if (existing) {
          throw new Error(
            `A segment with these conditions already exists: ${existing.name}`,
          );
        }
      }

      const dependsOn = doc.root
        ? await dependenciesOf(
            doc.contentType ||
              (
                await models.Segments.getSegment(_id)
              )?.contentType ||
              '',
            doc.root,
          )
        : undefined;

      await models.Segments.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            ...(dependsOn ? { dependsOn } : {}),
            updatedBy: userId,
          },
          ...(bumpsRevision ? { $inc: { revision: 1 } } : {}),
        },
      );

      return models.Segments.findOne({ _id }).lean<ISegmentDocument>();
    }

    public static async removeSegments(ids: string[]) {
      return models.Segments.deleteMany({ _id: { $in: ids } });
    }
  }

  segmentSchema.loadClass(Segment);

  return segmentSchema;
};
