import {
  LOYALTY_RULE_TYPES,
  loyaltyRuleIssue,
  loyaltyTierRuleIssue,
  resolveLoyaltyRules,
  resolveLoyaltyTierRule,
  TLoyaltyRule,
  TLoyaltyTierRule,
} from '../loyaltyRules';

const place = (
  stageId: string,
  probability: string,
  pipelineId = 'p1',
  boardId = 'b1',
) => ({ boardId, pipelineId, stageId, probability });

const everyBoard = (overrides: Partial<TLoyaltyRule> = {}): TLoyaltyRule => ({
  _id: 'rule-board',
  type: LOYALTY_RULE_TYPES.EVERY_BOARD,
  scoreCampaignId: 'c1',
  earn: { probability: 'Won' },
  refund: { probability: 'Lost' },
  ...overrides,
});

const everyPipeline = (
  overrides: Partial<TLoyaltyRule> = {},
): TLoyaltyRule => ({
  _id: 'rule-pipeline',
  type: LOYALTY_RULE_TYPES.EVERY_PIPELINE,
  scoreCampaignId: 'c1',
  boardId: 'b1',
  earn: { probability: '90%' },
  refund: { probability: 'Lost' },
  ...overrides,
});

const specificStages = (
  overrides: Partial<TLoyaltyRule> = {},
): TLoyaltyRule => ({
  _id: 'rule-stages',
  type: LOYALTY_RULE_TYPES.SPECIFIC_STAGES,
  scoreCampaignId: 'c1',
  boardId: 'b1',
  pipelineId: 'p1',
  earn: { stageIds: ['cashier'] },
  refund: { stageIds: ['ebarimt-return'] },
  ...overrides,
});

describe('resolveLoyaltyRules', () => {
  it('earns nothing without rules', () => {
    expect(resolveLoyaltyRules([], place('won', 'Won'))).toEqual({
      earns: [],
      refunds: false,
    });
  });

  it('every board earns at a Won stage of any pipeline', () => {
    const result = resolveLoyaltyRules(
      [everyBoard()],
      place('won', 'Won', 'p9', 'b9'),
    );

    expect(result.earns).toEqual([{ campaignId: 'c1', ruleId: 'rule-board' }]);
    expect(result.refunds).toBe(false);
  });

  it('every board earns nothing at a stage of another probability', () => {
    expect(
      resolveLoyaltyRules([everyBoard()], place('start', '10%')).earns,
    ).toEqual([]);
  });

  it('every board refunds at a Lost stage', () => {
    expect(resolveLoyaltyRules([everyBoard()], place('lost', 'Lost'))).toEqual({
      earns: [],
      refunds: true,
    });
  });

  it('a board rule replaces the every-board rule inside its board only', () => {
    const rules = [everyBoard(), everyPipeline()];

    expect(resolveLoyaltyRules(rules, place('won', 'Won')).earns).toEqual([]);
    expect(resolveLoyaltyRules(rules, place('almost', '90%')).earns).toEqual([
      { campaignId: 'c1', ruleId: 'rule-pipeline' },
    ]);
    expect(
      resolveLoyaltyRules(rules, place('won', 'Won', 'p9', 'b9')).earns,
    ).toEqual([{ campaignId: 'c1', ruleId: 'rule-board' }]);
  });

  it('specific stages count whatever their probability', () => {
    expect(
      resolveLoyaltyRules(
        [everyBoard(), specificStages()],
        place('cashier', '10%'),
      ).earns,
    ).toEqual([{ campaignId: 'c1', ruleId: 'rule-stages' }]);
  });

  it('specific stages switch off a Won stage they do not list', () => {
    expect(
      resolveLoyaltyRules(
        [everyBoard(), everyPipeline(), specificStages()],
        place('won', 'Won'),
      ).earns,
    ).toEqual([]);
  });

  it('specific stages leave other pipelines to the wider rules', () => {
    expect(
      resolveLoyaltyRules(
        [everyBoard(), specificStages()],
        place('won', 'Won', 'p2'),
      ).earns,
    ).toEqual([{ campaignId: 'c1', ruleId: 'rule-board' }]);
  });

  it('refunds only at the listed stages once stages are specific', () => {
    const rules = [everyBoard(), specificStages()];

    expect(
      resolveLoyaltyRules(rules, place('ebarimt-return', '50%')).refunds,
    ).toBe(true);
    expect(resolveLoyaltyRules(rules, place('lost', 'Lost')).refunds).toBe(
      false,
    );
  });

  it('overrides only within the same campaign', () => {
    const rules = [
      everyBoard({ _id: 'rule-board-c2', scoreCampaignId: 'c2' }),
      specificStages(),
    ];

    expect(resolveLoyaltyRules(rules, place('won', 'Won')).earns).toEqual([
      { campaignId: 'c2', ruleId: 'rule-board-c2' },
    ]);
  });

  it('gives one earn per campaign however many rules match', () => {
    const rules = [
      everyBoard(),
      everyBoard({ _id: 'rule-board-copy' }),
      everyBoard({ _id: 'rule-board-c2', scoreCampaignId: 'c2' }),
    ];

    expect(
      resolveLoyaltyRules(rules, place('won', 'Won')).earns.map(
        ({ campaignId }) => campaignId,
      ),
    ).toEqual(['c1', 'c2']);
  });
});

describe('loyaltyRuleIssue', () => {
  it('accepts a complete rule of each type', () => {
    expect(loyaltyRuleIssue(everyBoard())).toBeNull();
    expect(loyaltyRuleIssue(everyPipeline())).toBeNull();
    expect(loyaltyRuleIssue(specificStages())).toBeNull();
  });

  it('needs a campaign', () => {
    expect(loyaltyRuleIssue(everyBoard({ scoreCampaignId: '' }))).toBe(
      'no-campaign',
    );
  });

  it('needs the board or pipeline its type names', () => {
    expect(loyaltyRuleIssue(everyPipeline({ boardId: undefined }))).toBe(
      'no-board',
    );
    expect(loyaltyRuleIssue(specificStages({ pipelineId: undefined }))).toBe(
      'no-pipeline',
    );
  });

  it('needs somewhere to earn', () => {
    expect(loyaltyRuleIssue(everyBoard({ earn: {} }))).toBe('no-earn');
    expect(loyaltyRuleIssue(specificStages({ earn: { stageIds: [] } }))).toBe(
      'no-earn',
    );
  });

  it('rejects a stage that both earns and refunds', () => {
    expect(
      loyaltyRuleIssue(
        specificStages({
          earn: { stageIds: ['cashier'] },
          refund: { stageIds: ['cashier'] },
        }),
      ),
    ).toBe('earn-and-refund');
    expect(
      loyaltyRuleIssue(
        everyBoard({
          earn: { probability: 'Won' },
          refund: { probability: 'Won' },
        }),
      ),
    ).toBe('earn-and-refund');
  });
});

const tierRule = (
  overrides: Partial<TLoyaltyTierRule> = {},
): TLoyaltyTierRule => ({
  _id: 'tier-board',
  type: LOYALTY_RULE_TYPES.EVERY_BOARD,
  accountTypeId: 'w1',
  bands: [{ tier: 'gold', min: 1_000_000 }],
  earn: { probability: 'Won' },
  ...overrides,
});

describe('resolveLoyaltyTierRule', () => {
  it('sets no tier without rules or outside where the rule sets it', () => {
    expect(resolveLoyaltyTierRule([], place('won', 'Won'))).toBeNull();
    expect(
      resolveLoyaltyTierRule([tierRule()], place('start', '10%')),
    ).toBeNull();
  });

  it('lets only the narrowest rule decide, whatever wallet it names', () => {
    const pipelineRule = tierRule({
      _id: 'tier-pipeline',
      type: LOYALTY_RULE_TYPES.EVERY_PIPELINE,
      boardId: 'b1',
      accountTypeId: 'w2',
      earn: { probability: '90%' },
    });

    expect(
      resolveLoyaltyTierRule([tierRule(), pipelineRule], place('won', 'Won')),
    ).toBeNull();
    expect(
      resolveLoyaltyTierRule([tierRule(), pipelineRule], place('s', '90%')),
    ).toMatchObject({ _id: 'tier-pipeline', accountTypeId: 'w2' });
    expect(
      resolveLoyaltyTierRule(
        [tierRule(), pipelineRule],
        place('won', 'Won', 'p1', 'b2'),
      ),
    ).toMatchObject({ _id: 'tier-board' });
  });
});

describe('loyaltyTierRuleIssue', () => {
  it('needs a wallet and a tier on every band', () => {
    expect(loyaltyTierRuleIssue(tierRule())).toBeNull();
    expect(loyaltyTierRuleIssue(tierRule({ accountTypeId: '' }))).toBe(
      'no-wallet',
    );
    expect(loyaltyTierRuleIssue(tierRule({ bands: [] }))).toBe('no-bands');
    expect(loyaltyTierRuleIssue(tierRule({ bands: [{ tier: '' }] }))).toBe(
      'no-bands',
    );
  });

  it('needs somewhere to set the tier', () => {
    expect(loyaltyTierRuleIssue(tierRule({ earn: {} }))).toBe('no-earn');
  });
});
