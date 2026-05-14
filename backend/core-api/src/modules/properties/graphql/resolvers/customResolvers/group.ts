import { IContext } from '~/connectionResolvers';
import { IFieldGroupDocument } from '~/modules/properties/@types';

export default {
  async __resolveReference({ _id }: { _id: string }, { models }: IContext) {
    return models.FieldsGroups.findOne({ _id });
  },

  async createdBy({ createdBy }: IFieldGroupDocument) {
    if (!createdBy) {
      return null;
    }

    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: IFieldGroupDocument) {
    if (!updatedBy) {
      return null;
    }

    return { __typename: 'User', _id: updatedBy };
  },
};
