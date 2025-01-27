import { IContext } from '../../../connectionResolver';

interface IListParams {
  contentType: string;
  viewType: string;
}

const generateFilter = async (args: IListParams) => {
  const { contentType, viewType } = args;

  let filter: any = {};

  if (contentType) {
    filter.contentType = contentType;
  }

  if (viewType) {
    filter.viewType = viewType;
  }

  return filter;
};

const viewQueries = {
  viewList: async (_root, args: IListParams, { models }: IContext) => {
    const filter = await generateFilter(args);

    const list = await models.Views.find(filter).sort({ createdAt: 1 });

    const totalCount = await models.Views.find(filter).countDocuments();

    return { list, totalCount };
  },

  view: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    const view = await models.Views.getView(_id);

    return view;
  },
};

export default viewQueries;
