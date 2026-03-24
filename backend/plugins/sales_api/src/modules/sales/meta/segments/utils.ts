import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const generateProductsCategoryProductIds = async (
  subdomain,
  condition,
) => {
  let productCategoryIds: string[] = [];

  const { propertyName, propertyValue } = condition;
  if (propertyName === 'productsData.categoryId') {
    productCategoryIds.push(propertyValue);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        categoryIds: [...new Set(productCategoryIds)],
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    const productIds = products.map((product) => product._id);

    return productIds;
  }
  return [];
};

export const generateConditionStageIds = async (
  models: IModels,
  {
    boardId,
    pipelineId,
    options,
  }: {
    boardId?: string;
    pipelineId?: string;
    options?: any;
  },
) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await models.Boards.getBoard(boardId);

    const pipelines = await models.Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || [],
        },
      },
      { _id: 1 },
    );

    pipelineIds = pipelines.map((p) => p._id);
  }

  const stages = await models.Stages.find(
    { pipelineId: pipelineIds },
    { _id: 1 },
  );

  return stages.map((s) => s._id);
};
