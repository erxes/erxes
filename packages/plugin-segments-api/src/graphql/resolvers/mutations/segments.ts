import { moduleCheckPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "@erxes/api-utils/src/types";
import { putUpdateLog, putCreateLog, putDeleteLog } from "../../../logUtils";
import { Segments } from "../../../models";
import { ISegment } from "../../../models/definitions/segments";

interface ISegmentsEdit extends ISegment {
  _id: string;
  conditionSegments: ISegment[];
}

const segmentMutations = {
  /**
   * Create new segment
   */
  async segmentsAdd(_root, doc: ISegment, { user, docModifier }: IContext) {
    const extendedDoc = docModifier(doc);

    const conditionSegments = extendedDoc.conditionSegments;

    const segment = await Segments.createSegment(
      extendedDoc,
      conditionSegments
    );

    // if (doc.subOf) {
    //   registerOnboardHistory({ type: `subSegmentCreate`, user });
    // }

    await putCreateLog(
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
    { user }: IContext
  )
  {
    const segment = await Segments.getSegment(_id);
    const conditionSegments = doc.conditionSegments;

    const updated = await Segments.updateSegment(_id, doc, conditionSegments);

    await putUpdateLog(
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
  async segmentsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const segment = await Segments.getSegment(_id);
    const removed = await Segments.removeSegment(_id);

    await putDeleteLog({ type: 'segment', object: segment }, user);

    return removed;
  }
};

moduleCheckPermission(segmentMutations, 'manageSegments');

export default segmentMutations;
