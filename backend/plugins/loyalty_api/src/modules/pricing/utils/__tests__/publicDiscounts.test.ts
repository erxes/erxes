jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { recalculatePublicPricingPlanDiscounts } from '../publicDiscounts';

const mockedTRPC = sendTRPCMessage as jest.Mock;

const plan = (priority: 'public' | 'pipelineBase'): IPricingPlanDocument =>
  ({
    _id: `plan-${priority}`,
    status: 'active',
    priority,
    type: 'percentage',
    value: -5,
    priceAdjustType: 'none',
    priceAdjustFactor: 0,
    applyType: 'product',
    products: ['product-1'],
    pipelineId: priority === 'pipelineBase' ? 'pipeline-1' : undefined,
  } as IPricingPlanDocument);

it('synchronizes negative public and base adjustments', async () => {
  const plans = [plan('public'), plan('pipelineBase')];
  const models = {
    PricingPlans: {
      find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue(plans) })),
    },
  } as unknown as IModels;

  mockedTRPC
    .mockResolvedValueOnce([{ _id: 'product-1', unitPrice: 100 }])
    .mockResolvedValueOnce([{ _id: 'product-1', unitPrice: 100 }])
    .mockResolvedValueOnce(null);

  const result = await recalculatePublicPricingPlanDiscounts({
    models,
    subdomain: 'test',
  });

  expect(result).toEqual([
    {
      productId: 'product-1',
      discounts: [
        expect.objectContaining({ discount: -5, base: null }),
        expect.objectContaining({ discount: -5, base: true }),
      ],
    },
  ]);
});
