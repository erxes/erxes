/**
 * Integration spec: checkPricing must skip plans that fail the customer/broker
 * eligibility gate BEFORE computing any discount. The gate is wired in
 * utils/index.ts, so these are green.
 *
 * For reference, the wiring is — inside the plan loop, before processing items:
 *   const segmentCache = new Map(); // created once per checkPricing call
 *   if (!(await planMatchesContext(subdomain, plan,
 *         normalized participant context, segmentCache))) continue;
 * See backend/plugins/loyalty_api/AGENTS.md → "Customer & broker targeting".
 */
jest.mock('../product', () => ({
  getAllowedProducts: jest.fn(
    (_subdomain: string, _plan: unknown, productIds: string[]) => productIds,
  ),
}));

jest.mock('../rule', () => ({
  checkRepeatRule: jest.fn(() => true),
  calculateDiscountValue: jest.fn((_type: string, value: number) => value),
  calculatePriceAdjust: jest.fn(
    (_price: number, discountValue: number) => discountValue,
  ),
  calculatePriceRule: jest.fn(() => ({
    passed: true,
    type: '',
    value: 0,
    bonusProducts: [],
  })),
  calculateQuantityRule: jest.fn(() => ({
    passed: true,
    type: '',
    value: 0,
    bonusProducts: [],
  })),
  calculateExpiryRule: jest.fn(() => ({
    passed: true,
    type: '',
    value: 0,
    bonusProducts: [],
  })),
}));

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn().mockResolvedValue(false),
}));

import { IModels } from '~/connectionResolvers';
import {
  IPricingConditionRule,
  IPricingPlanDocument,
} from '@/pricing/@types/pricingPlan';
import { checkPricing, getMainConditions } from '../index';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const mockedTRPC = sendTRPCMessage as jest.Mock;

const DISCOUNT = 10;

const plan = (
  overrides: Partial<IPricingPlanDocument> = {},
): IPricingPlanDocument =>
  ({
    _id: 'plan-1',
    status: 'active',
    type: 'subtraction',
    value: DISCOUNT,
    applyType: 'product',
    products: ['p1'],
    priority: '',
    customerIds: [],
    customerTags: [],
    customerExcludeTags: [],
    customerSegmentIds: [],
    companyIds: [],
    companyTags: [],
    companyExcludeTags: [],
    companySegmentIds: [],
    userIds: [],
    userPositions: [],
    userSegmentIds: [],
    brokerCustomerIds: [],
    brokerCustomerTags: [],
    brokerCustomerExcludeTags: [],
    brokerCustomerSegmentIds: [],
    brokerCompanyIds: [],
    brokerCompanyTags: [],
    brokerCompanyExcludeTags: [],
    brokerCompanySegmentIds: [],
    brokerUserIds: [],
    brokerUserPositions: [],
    brokerUserSegmentIds: [],
    ...overrides,
    // Boundary cast: a full Mongoose document is impractical to build in a unit test.
  } as unknown as IPricingPlanDocument);

const makeModels = (plans: IPricingPlanDocument[]): IModels =>
  ({
    PricingPlans: {
      find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue(plans) })),
    },
    // Boundary cast: only PricingPlans.find is exercised by checkPricing.
  } as unknown as IModels);

const run = (
  plans: IPricingPlanDocument[],
  context: {
    prioritizeRule?: string;
    customerType?: 'customer' | 'company' | 'user';
    customerId?: string;
    brokerType?: 'customer' | 'company' | 'user';
    brokerId?: string;
  } = {},
) =>
  checkPricing({
    models: makeModels(plans),
    subdomain: 'test',
    prioritizeRule: 'exclude',
    totalAmount: 100,
    departmentId: '',
    branchId: '',
    pipelineId: '',
    orderItems: [{ itemId: 'i1', productId: 'p1', quantity: 1, price: 100 }],
    ...context,
  });

beforeEach(() => mockedTRPC.mockReset().mockResolvedValue(false));

describe('checkPricing — applies eligible plans', () => {
  it('applies an unconstrained plan even with no customer/broker (backwards compatible)', async () => {
    const result = await run([plan()]);
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('applies a plan whose customer constraint matches', async () => {
    const result = await run([plan({ customerIds: ['c1'] })], {
      customerId: 'c1',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('treats empty customer filters as all customers for customer typed input', async () => {
    const result = await run([plan()], {
      customerType: 'customer',
      customerId: 'c-any',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('preserves a negative POS-base adjustment', async () => {
    const result = await run([plan({ priority: 'posBase', value: -5 })], {
      prioritizeRule: 'only',
    });

    expect(result?.i1?.value).toBe(-5);
  });
});

describe('checkPricing — condition discounts', () => {
  const dented = (rule: Partial<IPricingConditionRule> = {}) => ({
    conditionRules: [
      {
        conditionCode: 'dented',
        discountType: 'percentage',
        discountValue: 30,
        priceAdjustType: 'none',
        priceAdjustFactor: 0,
        ...rule,
      } as IPricingConditionRule,
    ],
  });
  const line = (price: number, conditionCode?: string) => [
    { itemId: 'i1', productId: 'p1', quantity: 1, price, conditionCode },
  ];
  const sell = (
    rule?: Partial<IPricingConditionRule>,
    conditionCode = 'dented',
  ) =>
    checkPricing({
      models: makeModels([plan(dented(rule))]),
      subdomain: 'test',
      prioritizeRule: 'exclude',
      totalAmount: 100,
      orderItems: line(100, conditionCode),
    });

  it('prices the line by the condition rule instead of the plan', async () => {
    const result = await sell();
    expect(result?.i1?.value).toBe(30);
  });

  it('can give less than the plan would', async () => {
    const result = await sell({
      discountType: 'subtraction',
      discountValue: 5,
    });
    expect(result?.i1?.value).toBe(5);
  });

  it('keeps the plan discount for the default type', async () => {
    const result = await sell({ discountType: 'default' });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('gives the bonus product instead of a discount', async () => {
    const result = await sell({
      discountType: 'bonus',
      discountBonusProduct: 'gift',
    });
    expect(result?.i1?.bonusProducts).toEqual(['gift']);
    expect(result?.i1?.value).toBe(0);
  });

  it('leaves a line under another condition at the plan discount', async () => {
    const result = await sell({}, 'broken');
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  describe('POS-base plans at checkout', () => {
    // Sync already took the plan's 10 off the core price of 100.
    const checkout = (
      rule?: Partial<IPricingConditionRule>,
      conditionCode?: string,
    ) => {
      mockedTRPC.mockResolvedValue([{ _id: 'p1', unitPrice: 100 }]);

      return checkPricing({
        models: makeModels([plan({ priority: 'posBase', ...dented(rule) })]),
        subdomain: 'test',
        prioritizeRule: 'exclude',
        totalAmount: 90,
        orderItems: line(90, conditionCode),
      });
    };

    it('prices against the core price, minus what sync took', async () => {
      const result = await checkout({}, 'dented');
      expect(result?.i1?.value).toBe(20);
    });

    it('adds nothing for the default type, sync already applied it', async () => {
      const result = await checkout({ discountType: 'default' }, 'dented');
      expect(result?.i1?.value).toBe(0);
    });

    it('gives back what sync took when the condition is a bonus', async () => {
      const result = await checkout(
        { discountType: 'bonus', discountBonusProduct: 'gift' },
        'dented',
      );
      expect(result?.i1?.value).toBe(-10);
      expect(result?.i1?.bonusProducts).toEqual(['gift']);
    });

    it('leaves plain lines alone, the plan is already baked in', async () => {
      const result = await checkout();
      expect(result?.i1?.value).toBe(0);
    });
  });
});

describe('checkPricing — skips ineligible plans', () => {
  it('skips a plan whose customer is not targeted', async () => {
    const result = await run([plan({ customerIds: ['c1'] })], {
      customerId: 'c2',
    });
    expect(result?.i1?.value).toBe(0);
  });

  it('skips a customer-targeted plan when no customerId is supplied', async () => {
    const result = await run([plan({ customerIds: ['c1'] })], {});
    expect(result?.i1?.value).toBe(0);
  });

  it('skips a plan whose broker is not targeted', async () => {
    const result = await run([plan({ brokerUserIds: ['u1'] })], {
      brokerType: 'user',
      brokerId: 'u2',
    });
    expect(result?.i1?.value).toBe(0);
  });

  it('skips a customer-segment plan when the customer is not a member', async () => {
    mockedTRPC.mockResolvedValue(false); // isInSegment → false
    const result = await run([plan({ customerSegmentIds: ['seg-vip'] })], {
      customerId: 'c1',
    });
    expect(result?.i1?.value).toBe(0);
  });

  it('skips a company-constrained plan when no companyId is supplied', async () => {
    const result = await run([plan({ companyIds: ['co1'] })], {
      customerId: 'co1',
    });
    expect(result?.i1?.value).toBe(0);
  });

  it('applies a company-constrained plan whose companyId matches', async () => {
    const result = await run([plan({ companyIds: ['co1'] })], {
      customerType: 'company',
      customerId: 'co1',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('applies a user-constrained buyer plan whose userId matches', async () => {
    const result = await run([plan({ userIds: ['u1'] })], {
      customerType: 'user',
      customerId: 'u1',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('applies a customer-constrained broker plan whose brokerCustomerId matches', async () => {
    const result = await run([plan({ brokerCustomerIds: ['c-broker'] })], {
      brokerId: 'c-broker',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });

  it('applies a company-constrained broker plan whose brokerCompanyId matches', async () => {
    const result = await run([plan({ brokerCompanyIds: ['co-broker'] })], {
      brokerType: 'company',
      brokerId: 'co-broker',
    });
    expect(result?.i1?.value).toBe(DISCOUNT);
  });
});

describe('getMainConditions — location scope', () => {
  it('matches selected pipeline or plans with no pipeline', () => {
    const conditions = getMainConditions({ pipelineId: 'pipeline-1' });

    expect(conditions.$and).toContainEqual({
      $or: [{ pipelineId: 'pipeline-1' }, { pipelineId: { $in: [null, ''] } }],
    });
  });

  it('matches selected branch or plans with no branch', () => {
    const conditions = getMainConditions({ branchId: 'branch-1' });

    expect(conditions.$and).toContainEqual({
      $or: [{ branchIds: { $in: ['branch-1'] } }, { branchIds: { $size: 0 } }],
    });
  });

  it('only matches no-branch plans when no branch param is supplied', () => {
    const conditions = getMainConditions({});

    expect(conditions.$and).toContainEqual({ branchIds: { $size: 0 } });
  });
});
