import {
  addValidity,
  isCampaignIssuing,
  voucherExpiresAt,
} from '../voucherTerm';

const now = new Date('2026-10-14T00:00:00.000Z');

describe('isCampaignIssuing', () => {
  it('is always open without dates', () => {
    expect(isCampaignIssuing({}, now)).toBe(true);
    expect(isCampaignIssuing({ startDate: null, endDate: null }, now)).toBe(
      true,
    );
  });

  it('honours whichever side is set', () => {
    expect(
      isCampaignIssuing({ startDate: '2026-11-01T00:00:00.000Z' }, now),
    ).toBe(false);
    expect(
      isCampaignIssuing({ endDate: '2026-10-01T00:00:00.000Z' }, now),
    ).toBe(false);
    expect(
      isCampaignIssuing({ endDate: '2026-10-20T00:00:00.000Z' }, now),
    ).toBe(true);
  });
});

describe('addValidity', () => {
  it('adds days, weeks and months', () => {
    expect(addValidity(now, { count: 3, unit: 'day' })).toEqual(
      new Date('2026-10-17T00:00:00.000Z'),
    );
    expect(addValidity(now, { count: 2, unit: 'week' })).toEqual(
      new Date('2026-10-28T00:00:00.000Z'),
    );
    expect(addValidity(now, { count: 1, unit: 'month' }).getMonth()).toBe(
      (now.getMonth() + 1) % 12,
    );
  });
});

describe('voucherExpiresAt', () => {
  const ownEnd = '2026-11-14T00:00:00.000Z';

  it('keeps its own term past the campaign end', () => {
    expect(
      voucherExpiresAt(
        { config: { endDate: ownEnd } },
        { endDate: '2026-10-20T00:00:00.000Z' },
      ),
    ).toEqual(new Date(ownEnd));
  });

  it('is cut by the use deadline', () => {
    const deadline = '2026-11-01T00:00:00.000Z';

    expect(
      voucherExpiresAt(
        { config: { endDate: ownEnd } },
        { finishDateOfUse: deadline },
      ),
    ).toEqual(new Date(deadline));
  });

  it('follows the campaign without a term of its own', () => {
    const end = '2026-10-20T00:00:00.000Z';
    const deadline = '2026-10-30T00:00:00.000Z';

    expect(voucherExpiresAt({}, { endDate: end })).toEqual(new Date(end));
    expect(
      voucherExpiresAt({}, { endDate: end, finishDateOfUse: deadline }),
    ).toEqual(new Date(deadline));
  });

  it('never ends when nothing ends it', () => {
    expect(voucherExpiresAt({ config: null }, {})).toBeUndefined();
  });
});
