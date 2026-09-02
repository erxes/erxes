import {
  sameSegmentDefinition,
  sendSegmentForget,
  sendSegmentRebuild,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ISegmentCreate } from '../../db/models/Segments';
import { assertCanEditSegment } from '../../utils/access';
import { publishSegmentBuild } from '../../utils/publishBuild';

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

    assertCanEditSegment(segment, user);

    const asksSomethingElse =
      doc.root &&
      (!segment.root ||
        !sameSegmentDefinition(
          doc.contentType || segment.contentType,
          doc.root,
          segment.root,
        ));

    const updated = await models.Segments.updateSegment(_id, doc, user._id);

    if (asksSomethingElse) {
      sendSegmentRebuild({ subdomain, segmentId: _id });
    }

    return updated;
  },

  async segmentsRebuild(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    const segment = await models.Segments.getSegment(_id);

    if (!segment) {
      throw new Error('Segment not found');
    }

    assertCanEditSegment(segment, user);

    sendSegmentRebuild({ subdomain, segmentId: _id });

    return { queued: true };
  },

  async segmentsStopRebuild(
    _root,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    const segment = await models.Segments.getSegment(_id);

    if (!segment) {
      throw new Error('Segment not found');
    }

    assertCanEditSegment(segment, user);

    if (segment.status !== 'building') {
      throw new Error('This segment is not being rebuilt right now');
    }

    await models.Segments.updateOne(
      { _id },
      { $set: { buildCancelRequested: true } },
    );

    publishSegmentBuild({ segmentId: _id, buildCancelRequested: true });

    return { requested: true };
  },

  async segmentsRemove(
    _root,
    { ids }: { ids: string[] },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('segmentsManage');

    if (!ids?.length) {
      throw new Error('You should provide segment');
    }

    const removing = await models.Segments.find(
      { _id: { $in: ids } },
      { _id: 1, name: 1, ownerId: 1, contentType: 1 },
    ).lean();

    removing.forEach((segment) => assertCanEditSegment(segment, user));

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
