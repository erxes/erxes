import { Users } from '../../db/models';
import { IPipelineDocument } from '../../db/models/definitions/boards';
import { PIPELINE_VISIBLITIES } from '../../db/models/definitions/constants';

export default {
  members(pipeline: IPipelineDocument, {}) {
    if (pipeline.visibility === PIPELINE_VISIBLITIES.PRIVATE) {
      return Users.find({ _id: { $in: pipeline.memberIds } });
    }

    return [];
  },
};
