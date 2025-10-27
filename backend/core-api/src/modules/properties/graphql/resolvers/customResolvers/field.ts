import { IContext } from '~/connectionResolvers';
import { IFieldDocument } from '~/modules/properties/@types';

export default {
  async __resolveReference({ _id }: { _id: string }, { models }: IContext) {
    return models.Fields.findOne({ _id });
  },

  async createdBy({ createdBy }: IFieldDocument) {
    if (!createdBy) {
      return null;
    }

    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: IFieldDocument) {
    if (!updatedBy) {
      return null;
    }

    return { __typename: 'User', _id: updatedBy };
  },
};
