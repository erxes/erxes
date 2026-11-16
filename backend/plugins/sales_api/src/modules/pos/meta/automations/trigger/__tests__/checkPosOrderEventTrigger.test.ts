import { checkPosOrderEventTrigger } from '../checkPosOrderEventTrigger';

const order = { _id: 'o1', posId: 'pos-1', type: 'delivery', status: 'complete' };

describe('checkPosOrderEventTrigger', () => {
  it('fires paid when an order gets its first paidDate', () => {
    // A field the order never had arrives as added, not updated
    expect(
      checkPosOrderEventTrigger({
        target: { ...order, paidDate: new Date() } as never,
        config: { eventType: 'paid', posId: 'pos-1' },
        eventUpdateDescription: { added: { paidDate: new Date() } },
      }),
    ).toBe(true);
  });

  it('fires paid when paidDate goes from empty to set', () => {
    expect(
      checkPosOrderEventTrigger({
        target: order as never,
        config: { eventType: 'paid' },
        eventUpdateDescription: {
          updated: { paidDate: { prev: null, current: new Date() } },
        },
      }),
    ).toBe(true);
  });

  it('does not treat an update that only adds a field as a new order', () => {
    expect(
      checkPosOrderEventTrigger({
        target: order as never,
        config: { eventType: 'created' },
        eventUpdateDescription: { added: { paidDate: new Date() } },
      }),
    ).toBe(false);
  });

  it('fires returned when returnInfo is added the first time', () => {
    expect(
      checkPosOrderEventTrigger({
        target: order as never,
        config: { eventType: 'returned' },
        eventUpdateDescription: { added: { returnInfo: { cashAmount: 1 } } },
      }),
    ).toBe(true);
  });

  it('does not call a new order without a kitchen step delivered', () => {
    // posclient creates such an order as `complete`
    expect(
      checkPosOrderEventTrigger({
        target: order as never,
        config: { eventType: 'deliveryCompleted' },
      }),
    ).toBe(false);
  });

  it('calls a delivery done when posclient marks it done', () => {
    expect(
      checkPosOrderEventTrigger({
        target: { ...order, status: 'done' } as never,
        config: { eventType: 'deliveryCompleted' },
        eventUpdateDescription: {
          updated: { status: { prev: 'complete', current: 'done' } },
        },
      }),
    ).toBe(true);
  });
});
