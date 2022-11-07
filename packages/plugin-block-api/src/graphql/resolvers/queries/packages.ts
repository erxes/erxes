import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

const blockQueries = {
  async packages(
    _root,
    {
      type,
      searchValue,
      level,
      ...pagintationArgs
    }: {
      type: string;
      searchValue: string;
      level: string;
      page: number;
      perPage: number;
    },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    // search =========
    if (searchValue) {
      filter.name = {
        $in: [new RegExp(`.*${searchValue}.*`, 'i')]
      };
    }

    if (level) {
      console.log(level, 'tyuiop');
      filter.level = level;
    }

    return paginate(
      models.Packages.find(filter)
        .sort({ createdAt: -1 })
        .lean(),
      pagintationArgs
    );
  },

  async packageDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Packages.findOne({ _id });
  },

  packageCounts(
    _root,
    { type }: { type: string },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    return models.Packages.find(filter).countDocuments();
  }
};

export default blockQueries;
