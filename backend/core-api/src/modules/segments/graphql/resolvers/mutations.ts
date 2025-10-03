// import { checkPermission } from "@erxes/api-utils/src/permissions";
// import { IContext } from "../../../connectionResolver";
// import { putUpdateLog, putCreateLog, putDeleteLog } from "../../../logUtils";
// import { ISegment } from "../../../db/models/definitions/segments";
// import { registerOnboardHistory } from "../../modules/robot";

import { IContext } from '~/connectionResolvers';
import { ISegment } from '../../db/definitions/segments';
import { ISegmentsEdit } from '../../types';
import { checkPermission } from 'erxes-api-shared/core-modules';

export const segmentMutations = {
  /**
   * Create new segment
   */
  async segmentsAdd(
    _root,
    doc: ISegment,
    { models, user, __, subdomain }: IContext,
  ) {
    const extendedDoc: any = __(doc);

    const { conditionSegments = [] } = extendedDoc || {};

    return await models.Segments.createSegment(extendedDoc, conditionSegments);
  },

  /**
   * Update segment
   */
  async segmentsEdit(
    _root,
    { _id, ...doc }: ISegmentsEdit,
    { models, subdomain, user }: IContext,
  ) {
    const segment = await models.Segments.getSegment(_id);

    if (!segment) {
      throw new Error('Segment not found');
    }

    const { conditionSegments = [] } = doc || {};

    return await models.Segments.updateSegment(_id, doc, conditionSegments);
  },

  /**
   * Delete segment
   */
  async segmentsRemove(
    _root,
    { _id, ids }: { _id: string; ids: string[] },
    { models }: IContext,
  ) {
    if (!_id && !ids?.length) {
      throw new Error('You should provide segment');
    }

    if (ids.length) {
      return await models.Segments.removeSegments(ids);
    }
    return await models.Segments.removeSegment(_id);
  },
};

checkPermission(segmentMutations, 'segmentsAdd', 'manageSegments');
checkPermission(segmentMutations, 'segmentsEdit', 'manageSegments');
checkPermission(segmentMutations, 'segmentsRemove', 'manageSegments');
