import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ILabel, ILabelDocument } from '../../../models/definitions/labels';

const labelsMutations = {
  labelsEdit: async (
    _root: any,
    doc: { update: ILabelDocument[]; add: ILabel[] },
    { models }: IContext
  ) => {
    return await models.Labels.labelsEdit(doc);
  },

  labelsRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Labels.labelsRemove(_id);
  }
};

moduleRequireLogin(labelsMutations);
moduleCheckPermission(labelsMutations, 'manageSalesPlans');

export default labelsMutations;
