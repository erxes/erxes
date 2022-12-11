import { IContext } from '../../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Performs.findOne({ _id });
  }
};
