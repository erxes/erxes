import {
  adjustScoreActionConfigSchema,
  awardSpinActionConfigSchema,
  issueVoucherActionConfigSchema,
  setTierActionConfigSchema,
} from '../configSchemas';

const issuePaths = (result: {
  error?: { issues: { path: PropertyKey[] }[] };
}) => (result.error?.issues || []).map(({ path }) => path.join('.'));

describe('loyalty action configs', () => {
  it('gives a voucher or a spin to the run record when no owner is named', () => {
    expect(
      issueVoucherActionConfigSchema.safeParse({ voucherCampaignId: 'v1' })
        .success,
    ).toBe(true);
    expect(issuePaths(awardSpinActionConfigSchema.safeParse({}))).toEqual([
      'spinCampaignId',
    ]);
  });

  it('needs a wallet for a fixed score and a campaign otherwise', () => {
    expect(
      issuePaths(
        adjustScoreActionConfigSchema.safeParse({
          mode: 'fixed',
          attribution: '{{ trigger.customerId }}',
          points: '{{ trigger.amount }}',
        }),
      ),
    ).toEqual(['accountTypeId']);
    expect(
      issuePaths(
        adjustScoreActionConfigSchema.safeParse({
          attribution: '{{ trigger.customerId }}',
          campaignId: 'c1',
          action: 'subtract',
        }),
      ),
    ).toEqual(['action']);
  });

  it('needs bands to pick a tier from the amount', () => {
    expect(
      issuePaths(
        setTierActionConfigSchema.safeParse({
          attribution: '{{ trigger.customerId }}',
          accountTypeId: 'w1',
          mode: 'amount',
          bands: [],
        }),
      ),
    ).toEqual(['bands']);
  });
});
