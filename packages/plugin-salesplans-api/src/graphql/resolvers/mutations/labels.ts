import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ILabel } from '../../../models/definitions/labels';

const labelsMutations = {
  spLabelsAdd: async (_root: any, doc: ILabel, { models, user }: IContext) => {
    return await models.Labels.labelsAdd({
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
      createdUser: user._id,
      modifiedUser: user._id
    });
  },

  spLabelsEdit: async (
    _root: any,
    { _id, ...doc }: ILabel & { _id: string },
    { models, user }: IContext
  ) => {
    return await models.Labels.labelsEdit(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedUser: user._id
    });
  },

  labelsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.Labels.labelsRemove(_ids);
  }
};

moduleRequireLogin(labelsMutations);
moduleCheckPermission(labelsMutations, 'manageSalesPlans');

export default labelsMutations;
