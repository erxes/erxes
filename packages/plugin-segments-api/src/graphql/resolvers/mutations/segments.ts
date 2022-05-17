import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { putUpdateLog, putCreateLog, putDeleteLog } from '../../../logUtils';
import { sendCoreMessage } from '../../../messageBroker';
import { ISegment } from '../../../models/definitions/segments';

interface ISegmentsEdit extends ISegment {
  _id: string;
  conditionSegments: ISegment[];
}

const segmentMutations = {
  /**
   * Create new segment
   */
  async segmentsAdd(
    _root,
    doc: ISegment,
    { models, user, docModifier, subdomain }: IContext
  ) {
    const extendedDoc = docModifier(doc);

    const conditionSegments = extendedDoc.conditionSegments;

    const segment = await models.Segments.createSegment(
      extendedDoc,
      conditionSegments
    );

    if (doc.subOf) {
      sendCoreMessage({
        subdomain,
        action: 'registerOnboardHistory',
        data: {
          type: 'subSegmentCreate',
          user
        }
      });
    }

    await putCreateLog(
      subdomain,
      {
        type: 'segment',
        newData: doc,
        object: segment
      },
      user
    );

    return segment;
  },

  /**
   * Update segment
   */
  async segmentsEdit(
    _root,
    { _id, ...doc }: ISegmentsEdit,
    { models, subdomain, user }: IContext
  ) {
    const segment = await models.Segments.getSegment(_id);
    const conditionSegments = doc.conditionSegments;

    const updated = await models.Segments.updateSegment(
      _id,
      doc,
      conditionSegments
    );

    await putUpdateLog(
      subdomain,
      {
        type: 'segment',
        object: segment,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Delete segment
   */
  async segmentsRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const segment = await models.Segments.getSegment(_id);
    const removed = await models.Segments.removeSegment(_id);

    await putDeleteLog(subdomain, { type: 'segment', object: segment }, user);

    return removed;
  }
};

moduleCheckPermission(segmentMutations, 'manageSegments');

export default segmentMutations;
