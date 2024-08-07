import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { putUpdateLog, putCreateLog, putDeleteLog } from "../../../logUtils";
import { ISegment } from "../../../db/models/definitions/segments";
import { registerOnboardHistory } from "../../modules/robot";

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
      await registerOnboardHistory(models, "subSegmentCreate", user);
    }

    await putCreateLog(
      models,
      subdomain,
      {
        type: "segment",
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
      models,
      subdomain,
      {
        type: "segment",
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

    await putDeleteLog(
      models,
      subdomain,
      { type: "segment", object: segment },
      user
    );

    return removed;
  }
};

checkPermission(segmentMutations, "segmentsAdd", "manageSegments");
checkPermission(segmentMutations, "segmentsEdit", "manageSegments");
checkPermission(segmentMutations, "segmentsRemove", "manageSegments");

export default segmentMutations;
