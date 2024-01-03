import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { escapeRegExp } from '@erxes/api-utils/src/core';

const generateFilter = async (subdomain, params) => {
  let filter: any = { status: { $ne: 'deleted' } };

  if (params.name) {
    filter.name = {
      $in: [new RegExp(`.*${escapeRegExp(params.name)}.*`, 'i')]
    };
  }

  if (params?.kbCategoryIds?.length > 0) {
    filter.kbCategoryId = { $in: params.kbCategoryIds };
  }

  if (params?.branchIds?.length > 0) {
    const branches = await sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: {
        query: {
          _id: { $in: params?.branchIds }
        },
        fields: {
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const branchOrders = branches.map(branch => new RegExp(branch.order, 'i'));
    const branchIds = (
      await sendCoreMessage({
        subdomain,
        action: '',
        data: {
          query: {
            order: { $in: branchOrders }
          },
          fields: { _id: 1 }
        }
      })
    ).map(branch => branch._id);

    filter.branchIds = { $in: branchIds };
  }

  return filter;
};

const safetyTipQueries = {
  async safetyTips(_root, params, { models, subdomain }: IContext) {
    const filter = await generateFilter(subdomain, params);

    let sort;

    if (params.sortDirection) {
      sort.createdAt = params.sortDirection;
    }

    return await models.SafetyTips.find(filter).sort(sort);
  },
  async safetyTipsTotalCount(_root, params, { models, subdomain }: IContext) {
    const filter = await generateFilter(subdomain, params);

    return await models.SafetyTips.find(filter).count();
  }
};

export default safetyTipQueries;
