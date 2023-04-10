import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { generateFilter } from '../../../utils';
import { escapeRegExp } from '@erxes/api-utils/src/core';

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
  },
  async assetsActiveLocations(_root, params, { models }: IContext) {
    const {
      branchId,
      departmentId,
      companyId,
      customerId,
      teamMemberId,
      withKnowledgebase,
      searchValue
    } = params;

    let pipeline: any[] = [];

    if (withKnowledgebase || searchValue) {
      const filter: any = { $and: [] };

      if (withKnowledgebase) {
        filter.$and = [
          { kbArticleIds: { $exists: true } },
          { 'kbArticleIds.0': { $exists: true } }
        ];
      }

      if (searchValue) {
        filter.$and = [
          ...filter.$and,
          {
            $or: [
              {
                name: {
                  $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
                }
              },
              {
                code: {
                  $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
                }
              }
            ]
          }
        ];
      }

      const assetIds = await models.Assets.find(filter).distinct('_id');

      pipeline = [{ $match: { assetId: { $in: assetIds } } }];
    }

    pipeline = [
      ...pipeline,
      {
        $group: {
          _id: '$assetId',
          movements: {
            $push: '$$ROOT'
          }
        }
      },
      { $unwind: '$movements' },
      { $sort: { 'movements.assetId': 1 } },
      { $group: { _id: '$_id', movements: { $push: '$movements' } } },
      { $replaceRoot: { newRoot: { $arrayElemAt: ['$movements', 0] } } }
    ];

    const project = { _id: 0 };

    Object.entries({
      branchId,
      departmentId,
      companyId,
      customerId,
      teamMemberId
    }).forEach(([key, value]) => {
      if (value) {
        project[key] = 1;
      }
    });

    pipeline = [...pipeline, { $project: project }];
    const locations = await models.MovementItems.aggregate(pipeline);

    return locations;
  }
};

export default movementItemQueries;
