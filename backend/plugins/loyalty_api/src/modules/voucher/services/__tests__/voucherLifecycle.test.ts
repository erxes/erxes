import {
  holdStep,
  mayApplyTo,
  releaseStep,
  useStep,
} from '../voucherLifecycle';
import { termsOfCampaign, voucherTerms } from '../voucherTerm';

const order = { targetType: 'pos', targetId: 'order1' };
const otherOrder = { targetType: 'pos', targetId: 'order2' };

const free = { status: 'new' };
const heldHere = { status: 'onhold', usedIn: order };
const usedHere = { status: 'used', usedIn: order };
const cancelled = { status: 'cancelled' };

describe('holdStep', () => {
  it('holds a free voucher and keeps one already held here', () => {
    expect(holdStep(free, order)).toBe('apply');
    expect(holdStep(heldHere, order)).toBe('noop');
  });

  it('refuses one held by, or used on, another order', () => {
    expect(() => holdStep(heldHere, otherOrder)).toThrow('another order');
    expect(() => holdStep(usedHere, otherOrder)).toThrow('already used');
    expect(() => holdStep(cancelled, order)).toThrow('cancelled');
  });
});

describe('releaseStep', () => {
  it('frees only the order holding it', () => {
    expect(releaseStep(heldHere, order)).toBe('apply');
    expect(releaseStep(free, order)).toBe('noop');
    expect(() => releaseStep(heldHere, otherOrder)).toThrow('another order');
  });

  it('cannot free a voucher a paid order used', () => {
    expect(() => releaseStep(usedHere, order)).toThrow('already used');
  });
});

describe('useStep', () => {
  it('uses a free voucher or the one held for this order', () => {
    expect(useStep(free, order)).toBe('apply');
    expect(useStep(heldHere, order)).toBe('apply');
    expect(useStep(free)).toBe('apply');
  });

  it('changes nothing when the same order syncs again', () => {
    expect(useStep(usedHere, order)).toBe('noop');
  });

  it('refuses a second order', () => {
    expect(() => useStep(usedHere, otherOrder)).toThrow('already used');
    expect(() => useStep(heldHere, otherOrder)).toThrow('another order');
  });
});

describe('mayApplyTo', () => {
  it('prices a free voucher, or this order its own', () => {
    expect(mayApplyTo(free)).toBe(true);
    expect(mayApplyTo(heldHere, 'order1')).toBe(true);
    expect(mayApplyTo(usedHere, 'order1')).toBe(true);
  });

  it('never prices one belonging to another order', () => {
    expect(mayApplyTo(heldHere)).toBe(false);
    expect(mayApplyTo(heldHere, 'order2')).toBe(false);
    expect(mayApplyTo(cancelled, 'order1')).toBe(false);
  });
});

describe('voucherTerms', () => {
  const campaign = {
    title: 'dsafg',
    voucherType: 'discount',
    kind: 'percent',
    value: 8,
    restrictions: { minimumSpend: 1000 },
  };

  it('keeps what was promised when issued', () => {
    const terms = termsOfCampaign(campaign);

    expect(voucherTerms({ terms }, { ...campaign, value: 10 })).toMatchObject({
      value: 8,
      kind: 'percent',
    });
  });

  it('follows the campaign for a voucher issued before terms were kept', () => {
    expect(voucherTerms({}, { ...campaign, value: 10 }).value).toBe(10);
  });
});
