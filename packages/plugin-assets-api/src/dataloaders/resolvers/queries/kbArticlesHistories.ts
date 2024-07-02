import { IContext } from '../../../connectionResolver';

const kbArticlesHistoriesQueries = {
  async assetKbArticlesHistories(_root, { assetId }, { models }: IContext) {
    return await models.AssetsKbArticlesHistories.find({ assetId }).sort({
      createAt: -1
    });
  }
};

export default kbArticlesHistoriesQueries;
