import { getPureDate, paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

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
  async posCovers(_root, params, { models }: IContext) {
    const query = await generateFilterQuery(models, params);

    return paginate(
      models.Covers.find(query)
        .sort({ createdAt: -1 })
        .lean(),
      {
        ...params
      }
    );
  },

  async posCoversCount(_root, params, { models }: IContext) {
    return models.Covers.find({
      ...(await generateFilterQuery(models, params))
    }).count();
  },

  async posCoverDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Covers.getCover(_id);
  }
};

export default coverQueries;
