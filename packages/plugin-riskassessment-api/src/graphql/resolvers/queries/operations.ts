import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';

const generateFilter = async (models: IModels, params) => {
  let filter: any = {};

  if (params.searchValue) {
    const operationOrders = (
      await models.Operations.find({
        $or: [
          { name: { $regex: new RegExp(params.searchValue, 'i') } },
          { code: { $regex: new RegExp(params.searchValue, 'i') } }
        ]
      })
    )
      .map(operation => operation.code)
      .join('|');

    filter.order = { $regex: new RegExp(operationOrders), $options: 'i' };
  }
  return filter;
};

const operationQueries = {
  async operations(_root, params, { models }: IContext) {
    const filter = await generateFilter(models, params);

    return paginate(models.Operations.find(filter), params);
  },
  async operationsTotalCount(_root, params, { models }: IContext) {
    const filter = await generateFilter(models, params);

    return await models.Operations.find(filter).countDocuments();
  },
  async operation(_root, { _id }, { models }: IContext) {
    const operation = await models.Operations.findOne({ _id });

    if (!operation) {
      throw new Error(`Not found operation`);
    }
    return operation;
  }
};

checkPermission(operationQueries, 'operations', 'manageRiskAssessment');
checkPermission(
  operationQueries,
  'operationsTotalCount',
  'manageRiskAssessment'
);
checkPermission(operationQueries, 'operation', 'manageRiskAssessment');

export default operationQueries;
