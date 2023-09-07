import { IContext } from '../../../connectionResolver';

export default {
  mapsReverseGeocoding(_root, _args, { models }: IContext) {
    return models.Apps.find().lean();
  },
  mapsGeocoding(_root, _args, { models }: IContext) {
    return models.Apps.countDocuments();
  },
  mapsRoute(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Apps.findOne({ _id });
  }
};
