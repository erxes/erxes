jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn().mockResolvedValue({ PricingPlans: {} }),
}));

jest.mock('@/pricing/utils/publicDiscounts', () => ({
  recalculateProductPricingPlanDiscounts: jest.fn(),
}));

jest.mock('../afterProcessHandlers/coreMerge', () => ({
  handleCoreMergeMutation: jest.fn(),
  mergeMutationNames: [],
}));

import { generateModels } from '~/connectionResolvers';
import { recalculateProductPricingPlanDiscounts } from '@/pricing/utils/publicDiscounts';
import { afterProcess } from '../afterProcess';

const mockedGenerateModels = generateModels as jest.Mock;
const mockedRecalculate = recalculateProductPricingPlanDiscounts as jest.Mock;

// One shape satisfies both the created and the updated document handlers.
const productEvent = (docId: string) => ({
  data: {
    collectionName: 'products',
    contentType: 'core:products.products',
    docId,
    userId: 'user-1',
    processId: 'process-1',
    updateDescription: { added: {}, updated: {}, removed: [] },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

it.each(['afterDocumentCreated', 'afterDocumentUpdated'] as const)(
  'recalculates product discounts on %s',
  async (handlerName) => {
    const handler = afterProcess[handlerName];

    await handler?.({ subdomain: 'test' }, productEvent('product-1'));

    expect(mockedRecalculate).toHaveBeenCalledWith({
      models: await mockedGenerateModels.mock.results[0].value,
      subdomain: 'test',
      productId: 'product-1',
    });
  },
);

it('ignores product events without a document id', async () => {
  await afterProcess.afterDocumentUpdated?.(
    { subdomain: 'test' },
    productEvent(''),
  );

  expect(mockedRecalculate).not.toHaveBeenCalled();
});
