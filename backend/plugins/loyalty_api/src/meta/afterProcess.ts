import { AfterProcessConfigs } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  handleCoreMergeMutation,
  mergeMutationNames,
} from './afterProcessHandlers/coreMerge';
import { recalculateProductPricingPlanDiscounts } from '@/pricing/utils/publicDiscounts';

type ProductDocumentEvent = {
  data?: {
    docId?: string;
  };
};

const syncProductDiscounts = async (
  subdomain: string,
  input: ProductDocumentEvent,
) => {
  const productId = input.data?.docId;

  if (!productId) {
    return;
  }

  await recalculateProductPricingPlanDiscounts({
    models: await generateModels(subdomain),
    subdomain,
    productId,
  });
};

export const afterProcess: AfterProcessConfigs = {
  rules: [
    {
      type: 'afterMutation',
      mutationNames: [...mergeMutationNames],
    },
    {
      type: 'createdDocument',
      contentTypes: ['core:products.products'],
    },
    {
      type: 'updatedDocument',
      contentTypes: ['core:products.products'],
    },
  ],
  afterMutation: async (ctx, input) => {
    await handleCoreMergeMutation(
      await generateModels(ctx.subdomain),
      input?.data,
    );
  },
  afterDocumentCreated: async (ctx, input) => {
    await syncProductDiscounts(ctx.subdomain, input);
  },
  afterDocumentUpdated: async (ctx, input) => {
    await syncProductDiscounts(ctx.subdomain, input);
  },
};
