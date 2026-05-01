import { getPureDate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { paginate } from './orders';

const generateFilterQuery = async (models, params) => {
  const query: any = {};
  const { startDate, endDate, userId, posId, posToken } = params;

  if (posId) {
    const pos = await models.Pos.findOne({ _id: posId }).lean();
    query.posToken = pos.token;
  }

  if (posToken) {
    const pos = await models.Pos.findOne({ token: posToken }).lean();
    query.posToken = pos.token;
  }

  if (userId) {
    query.userId = userId;
  }

  const dateQry: any = {};

  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }

  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  }

  if (Object.keys(dateQry).length) {
    query.endDate = dateQry;
  }

  return query;
};

const coverQueries = {
  async posCovers(_root, params, { models, checkPermission }: IContext) {
    await checkPermission('posCoversRead');
    const query = await generateFilterQuery(models, params);
    return paginate(models.Covers.find(query).sort({ createdAt: -1 }).lean(), {
      ...params,
    });
  },

  async posCoversCount(_root, params, { models, checkPermission }: IContext) {
    await checkPermission('posCoversRead');
    return models.Covers.find({
      ...(await generateFilterQuery(models, params)),
    }).countDocuments();
  },

  async posCoverDetail(_root, { _id }: { _id: string }, { models, checkPermission }: IContext) {
    await checkPermission('posCoversRead');
    return models.Covers.getCover(_id);
  },
};

export default coverQueries;