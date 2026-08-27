import {
  sendSegmentForget,
  sendSegmentRebuild,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ISegmentCreate } from '../../db/models/Segments';

/**
 * Every write here queues the membership work it implies.
 *
 * Record-driven recomputation only ever re-decides the records that moved,
 * which cannot notice that the question itself changed. So a saved definition
 * asks for a rebuild, and a deleted one asks for its id to come off the records
 * still carrying it - otherwise both keep answering with yesterday's segment.
 */
export const segmentMutations = {
  async segmentsAdd(
    _root,
    doc: ISegmentCreate,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    const segment = await models.Segments.createSegment(doc, user._id);

    sendSegmentRebuild({ subdomain, segmentId: segment._id });

    return segment;
  },

  async segmentsEdit(
    _root,
    { _id, ...doc }: ISegmentCreate & { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    const segment = await models.Segments.getSegment(_id);

    if (!segment) {
      throw new Error('Segment not found');
    }

    const updated = await models.Segments.updateSegment(_id, doc, user._id);

    // Only a changed tree changes who belongs; renaming or recolouring does
    // not, and rebuilding for those would empty the segment for no reason.
    if (doc.root) {
      sendSegmentRebuild({ subdomain, segmentId: _id });
    }

    return updated;
  },

  async segmentsRemove(
    _root,
    { ids }: { ids: string[] },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    if (!ids?.length) {
      throw new Error('You should provide segment');
    }

    // Read before the delete: once the segments are gone, nothing knows which
    // collections are still carrying their ids.
    const removing = await models.Segments.find(
      { _id: { $in: ids } },
      { _id: 1, contentType: 1 },
    ).lean();

    const result = await models.Segments.removeSegments(ids);

    const byContentType = new Map<string, string[]>();

    for (const segment of removing) {
      byContentType.set(segment.contentType, [
        ...(byContentType.get(segment.contentType) || []),
        segment._id,
      ]);
    }

    for (const [contentType, segmentIds] of byContentType) {
      sendSegmentForget({ subdomain, contentType, segmentIds });
    }

    return result;
  },
};
