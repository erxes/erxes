import { IContext } from '../../../connectionResolver';

const saasQueries = {
  async packages(
    _root,
    _params,

    { models }: IContext,
  ) {
    return models.Packages.find({}).sort({ createdAt: -1 }).lean();
  },
};

export default saasQueries;
