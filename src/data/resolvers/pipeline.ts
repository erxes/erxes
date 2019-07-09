import { Users } from '../../db/models';
import { IPipelineDocument } from '../../db/models/definitions/boards';
import { PIPELINE_VISIBLITIES } from '../../db/models/definitions/constants';
import { IUserDocument } from '../../db/models/definitions/users';

export default {
  members(pipeline: IPipelineDocument, {}) {
    if (pipeline.visibility === PIPELINE_VISIBLITIES.PRIVATE) {
      return Users.find({ _id: { $in: pipeline.memberIds } });
    }

    return [];
  },

  isWatched(pipeline: IPipelineDocument, _args, { user }: { user: IUserDocument }) {
    const watchedUserIds = pipeline.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },
};
