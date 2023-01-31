import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { generateFilter } from '../../../utils';

const movementItemQueries = {
  async assetMovementItems(_root, params, { models, subdomain }: IContext) {
    const filter = await generateFilter(params, 'movementItems', subdomain);

    return await paginate(
      models.MovementItems.find(filter).sort({ createdAt: -1 }),
      params
    );
  },

  async assetMovementItemsTotalCount(
    _root,
    params,
    { models, subdomain }: IContext
  ) {
    const filter = await generateFilter(params, 'movmentItems', subdomain);

    return models.MovementItems.find(filter).countDocuments();
  },

  async currentAssetMovementItems(_root, { assetIds }, { models }: IContext) {
    return models.MovementItems.movementItemsCurrentLocations(assetIds);
  },

  async assetMovementItem(_root, { assetId }, { models }: IContext) {
    const item = await models.MovementItems.findOne({ assetId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!item) {
      const asset = await models.Assets.findOne({ _id: assetId });
      if (!asset) {
        throw new Error(`Could not find asset with this id ${assetId}`);
      }
      return {
        assetId,
        assetName: asset.name,
        branchId: null,
        departmentId: null,
        customerId: null,
        companyId: null,
        teamMemberId: null,
        sourceLocations: {
          branchId: null,
          departmentId: null,
          customerId: null,
          companyId: null,
          teamMemberId: null
        }
      };
    }
    return item;
  }
};

export default movementItemQueries;
