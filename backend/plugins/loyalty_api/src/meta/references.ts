import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';

type TCoreCustomerReferenceTarget = {
  _id?: string;
  score?: number;
};

export const loyaltyReferences: TRecordReferencesConfig<
  IModels,
  TCoreCustomerReferenceTarget
> = {
  types: [],

  extensions: [
    {
      type: 'core:customer',
      fields: [
        {
          key: 'loyalty',
          label: 'Loyalty',
          resolver: 'customerLoyalty',
          fields: [
            {
              key: 'loyaltyScore',
              label: 'Loyalty score',
            },
            {
              key: 'scoreLogCount',
              label: 'Score log count',
            },
          ],
        },
      ],
    },
  ],

  fetchers: {},

  resolvers: {
    customerLoyalty: async ({ models, target }) => {
      const loyaltyScore = Number(target.score) || 0;

      if (!target._id) {
        return {
          loyaltyScore,
          scoreLogCount: 0,
        };
      }

      const scoreLogCount = await models.ScoreLogs.countDocuments({
        ownerType: 'customer',
        ownerId: target._id,
      });

      return {
        loyaltyScore,
        scoreLogCount,
      };
    },
  },

  generateModels,
};
