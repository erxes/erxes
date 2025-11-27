// clientPortalFieldConfigsAdd

import { IContext } from '~/connectionResolvers';

const fieldMutations = {
  async clientPortalFieldConfigsEdit(_root, args: any, { models }: IContext) {
    // return models.FieldConfigs.createOrUpdate(args);
    return [];
  },
};

export default fieldMutations;
