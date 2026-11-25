import {
  IPapaTokenStore,
  isTrustedPapaUrl,
  isUncertainPapaFailure,
  PapaApiError,
  PapaClient,
  TPapaFetch,
} from '../client';
import {
  buildCallbackUrl,
  buildDriverNote,
  buildDynamicCreateInput,
  expandCarTypes,
  mergeRefreshedDelivery,
  normalizeMnPhone,
  orderToDelivery,
  matchPapaLocation,
  papaDealStep,
  papaStatusDate,
  planPapaAutoSend,
  readDeliveryPin,
  shouldMoveDeal,
  trimTrailingSlashes,
} from '../mapping';
import { summarizePapaReport } from '../report';

class MemoryStore implements IPapaTokenStore {
  public values = new Map<string, string>();

  async get(key: string) {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string) {
    this.values.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    this.values.delete(key);
    return 1;
  }
}

type TCall = { url: string; body: Record<string, unknown>; auth?: string };

const fakeFetch = (
  handler: (call: TCall) => { status: number; json: unknown },
  calls: TCall[],
): TPapaFetch => {
  return async (url, init) => {
    const call = {
      url,
      body: JSON.parse(init.body),
      auth: init.headers.Authorization,
    };
    calls.push(call);
    const { status, json } = handler(call);

    return {
      status,
      ok: status < 400,
      text: async () => JSON.stringify(json),
    };
  };
};

const credentials = {
  apiUrl: 'https://dev-api.papa.mn/api/v4/',
  clientId: 'client',
  clientSecret: 'secret',
};

describe('Papa mapping', () => {
  it('expands UI car groups into Papa car types', () => {
    expect(expandCarTypes(['car'])).toEqual(['PASSANGER_CAR']);
    expect(expandCarTypes(['light'])).toEqual(['ON_FOOT', 'MOPED', 'BICYCLE']);
    expect(expandCarTypes([])).toHaveLength(4);
    expect(expandCarTypes(['truck'])).toHaveLength(4);
  });

  it('normalizes Mongolian phones', () => {
    expect(normalizeMnPhone('9911-2233')).toBe('99112233');
    expect(normalizeMnPhone('+976 9911 2233')).toBe('99112233');
    expect(normalizeMnPhone('12345')).toBeUndefined();
    expect(normalizeMnPhone(undefined)).toBeUndefined();
  });

  it('builds a dynamic create body referencing the erxes order', () => {
    const body = buildDynamicCreateInput({
      orderId: 'order1',
      orderNumber: '20261110_0001',
      quoteId: 'quote1',
      staffId: 'staff1',
      posConfig: {
        categoryId: 'cat',
        conditionId: 'cond',
        carTypeGroups: ['car'],
      },
      receiverPhone: '99112233',
      description: '  ring twice ',
    });

    expect(body.reference_id).toBe('order1');
    expect(body.cargo.reference_id).toBe('order1');
    expect(body.car_type).toEqual(['PASSANGER_CAR']);
    expect(body.description).toBe('ring twice');
    expect(body.cargo.is_other_receive_pay).toBe(false);
  });

  it('requires category and condition', () => {
    expect(() =>
      buildDynamicCreateInput({
        orderId: 'o',
        orderNumber: '1',
        quoteId: 'q',
        staffId: 's',
        posConfig: {},
        receiverPhone: '99112233',
      }),
    ).toThrow('category and condition');
  });

  it('projects a Papa order', () => {
    const now = new Date();
    const delivery = orderToDelivery(
      {
        id: 'p1',
        parcel_order_status: 'CREATING_SHIPPING',
        pincode: '1234',
        amount: 8000,
        cargo: {
          id: 'c1',
          shipping_id: 's1',
          cargo_status: 'CREATING_SHIPPING',
        },
        driver_info: { firstname: 'Bat' },
      },
      now,
    );

    expect(delivery).toMatchObject({
      status: 'CREATING_SHIPPING',
      papaOrderId: 'p1',
      pincode: '1234',
      price: 8000,
      shippingId: 's1',
      driver: { firstname: 'Bat' },
    });
  });

  it('reads payment from unpaid_amount, not Papa is_paid', () => {
    const now = new Date();
    const unpaid = orderToDelivery(
      {
        id: 'p1',
        parcel_order_status: 'END',
        is_paid: true,
        unpaid_amount: 10000,
      },
      now,
    );
    const paid = orderToDelivery(
      {
        id: 'p1',
        parcel_order_status: 'COMPLETED',
        is_paid: true,
        unpaid_amount: 0,
      },
      now,
    );

    expect(unpaid).toMatchObject({ isPaid: false, unpaidAmount: 10000 });
    expect(paid).toMatchObject({ isPaid: true, unpaidAmount: 0 });
  });

  it('trims trailing slashes', () => {
    expect(trimTrailingSlashes('https://a.papa.mn/api/v4///')).toBe(
      'https://a.papa.mn/api/v4',
    );
    expect(trimTrailingSlashes('https://a.papa.mn')).toBe('https://a.papa.mn');
    expect(trimTrailingSlashes('///')).toBe('');
  });

  it('builds the gateway callback URL', () => {
    expect(
      buildCallbackUrl(
        'https://dts.erxes.io/gateway/',
        '/papa-callback',
        'abc',
      ),
    ).toBe('https://dts.erxes.io/gateway/pl:sales/papa-callback/abc');
  });
});

describe('PapaClient', () => {
  it('authenticates once, caches the token and unwraps data', async () => {
    const calls: TCall[] = [];
    const store = new MemoryStore();
    const client = new PapaClient(
      credentials,
      store,
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) {
          return {
            status: 200,
            json: {
              success: true,
              data: { access_token: 't1', staff_id: 's1' },
            },
          };
        }
        return {
          status: 200,
          json: {
            success: true,
            data: { id: 'p1', parcel_order_status: 'NEW' },
          },
        };
      }, calls),
    );

    const first = await client.getDynamicOrder('p1');
    await client.getDynamicOrder('p1');

    expect(first.id).toBe('p1');
    expect(calls.filter((c) => c.url.endsWith('/auth/token'))).toHaveLength(1);
    expect(calls[1].url).toBe(
      'https://dev-api.papa.mn/api/v4/parcel_order/dynamic/get',
    );
    expect(calls[1].auth).toBe('Bearer t1');
  });

  it('re-authenticates once when the cached token is rejected', async () => {
    const calls: TCall[] = [];
    const store = new MemoryStore();
    let issued = 0;
    const client = new PapaClient(
      credentials,
      store,
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) {
          issued += 1;
          return {
            status: 200,
            json: { success: true, data: { access_token: `t${issued}` } },
          };
        }
        if (call.auth === 'Bearer stale') {
          return { status: 401, json: { success: false, message: 'expired' } };
        }
        return {
          status: 200,
          json: { success: true, data: { rows: [], count: 0 } },
        };
      }, calls),
    );

    await client.authenticate();
    const [key] = Array.from(store.values.keys());
    store.values.set(key, 'stale');

    await expect(client.listAddresses()).resolves.toEqual({
      rows: [],
      count: 0,
    });
    expect(calls[calls.length - 1].auth).toBe('Bearer t2');
  });

  it('surfaces Papa error messages', async () => {
    const store = new MemoryStore();
    const client = new PapaClient(
      credentials,
      store,
      fakeFetch(
        (call) =>
          call.url.endsWith('/auth/token')
            ? {
                status: 200,
                json: { success: true, data: { access_token: 't' } },
              }
            : {
                status: 200,
                json: { success: false, message: 'Quote expired' },
              },
        [],
      ),
    );

    await expect(client.getShipping('s1')).rejects.toBeInstanceOf(PapaApiError);
    await expect(client.getShipping('s1')).rejects.toThrow('Quote expired');
  });

  const quoteInput = {
    address_id: 'addr1',
    to_location_id: 'loc1',
    to_latitude: '47.7728',
    to_longitude: '106.8660',
    to_address: 'Хан-Уул',
    size: 'SMALL' as const,
  };
  const ok = (data: unknown) => ({
    status: 200,
    json: { success: true, data },
  });
  const refused = {
    status: 200,
    json: { success: false, message: 'Илгээсэн мэдэлэл зөрүүтэй байна' },
  };

  it('quotes through the nearest Papa point in the example shape', async () => {
    const calls: TCall[] = [];
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/point/elastic')) return ok([{ id: 'point1' }]);
        return ok({ id: 'quote1', user_price: 9000 });
      }, calls),
    );

    const quote = await client.quote(quoteInput);
    const body = calls[calls.length - 1].body;

    expect(quote.id).toBe('quote1');
    expect(body).toEqual({
      order_type: 'PARCEL_ORDER',
      size: 'SMALL',
      address_id: 'addr1',
      to_point_id: 'point1',
    });
  });

  it('explains a location with no Papa point near it, without quoting', async () => {
    const calls: TCall[] = [];
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/point/elastic')) return ok([]);
        return refused;
      }, calls),
    );

    await expect(client.quote(quoteInput)).rejects.toThrow('no delivery point');
    expect(calls.some((call) => call.url.endsWith('/calculate'))).toBe(false);
  });

  it('names the pickup address when Papa calls the quote wrong', async () => {
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/point/elastic')) return ok([{ id: 'point1' }]);
        return {
          status: 400,
          json: { success: false, message: 'Илгээсэн мэдээлэл буруу байна' },
        };
      }, []),
    );

    await expect(client.quote(quoteInput)).rejects.toThrow('pickup address');
  });

  it('reads the wallet and pays an order from it or outside Papa', async () => {
    const calls: TCall[] = [];
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/wallet/fiat')) {
          return ok({ code: 'AC1', balance: '990000.00', hold: '0.00' });
        }
        return ok({ id: 'invoice1' });
      }, calls),
    );

    const wallet = await client.getWallet('partner1');
    await client.payFromWallet('p1', 's1');
    await client.markPaidOutside('p1');
    const body = (path: string) =>
      calls.find((call) => call.url.endsWith(path))?.body;

    expect(wallet.balance).toBe('990000.00');
    expect(body('/wallet/fiat')).toEqual({ partner_id: 'partner1' });
    expect(body('/invoice/create/wallet')).toEqual({
      staff_id: 's1',
      object_id: 'p1',
      object_type: 'PARCEL_ORDER',
      is_tip: false,
      tip_amount: null,
    });
    expect(body('/parcel_order/cash_payment')).toEqual({
      id: 'p1',
      is_tip: false,
      tip_amount: null,
    });
  });

  it('only trusts https papa.mn hosts with credentials', () => {
    expect(isTrustedPapaUrl('https://dev-api.papa.mn/api/v4')).toBe(true);
    expect(isTrustedPapaUrl('https://papa.mn/api/v4')).toBe(true);
    expect(isTrustedPapaUrl('http://dev-api.papa.mn/api/v4')).toBe(false);
    expect(isTrustedPapaUrl('https://papa.mn.attacker.io/api')).toBe(false);
    expect(isTrustedPapaUrl('https://evilpapa.mn/api')).toBe(false);
    expect(isTrustedPapaUrl('https://user:pw@api.papa.mn/api')).toBe(false);
    expect(isTrustedPapaUrl('not a url')).toBe(false);
    expect(
      () =>
        new PapaClient(
          { ...credentials, apiUrl: 'https://attacker.example/api' },
          new MemoryStore(),
          fakeFetch(() => ok({}), []),
        ),
    ).toThrow('papa.mn');
  });

  it('treats only timeouts and server errors as uncertain', () => {
    expect(isUncertainPapaFailure(new PapaApiError('x', 0, '/'))).toBe(true);
    expect(isUncertainPapaFailure(new PapaApiError('x', 502, '/'))).toBe(true);
    expect(isUncertainPapaFailure(new PapaApiError('x', 400, '/'))).toBe(false);
    expect(isUncertainPapaFailure(new Error('x'))).toBe(false);
  });

  it('recovers the live Papa order by name, confirmed by reference_id', async () => {
    const calls: TCall[] = [];
    const references: Record<string, string> = {
      cancelled: 'o1',
      newest: 'o1',
      other: 'o2',
    };
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/dynamic/get')) {
          const id = String(call.body.id);
          return ok({ id, reference_id: references[id] });
        }
        // The list has no reference_id, as Papa dev returns it.
        return ok({
          rows: [
            {
              id: 'other',
              name: 'Order 2',
              parcel_order_status: 'CONFIRM',
              created_at: '2026-11-16T05:40:00Z',
            },
            {
              id: 'newest',
              name: 'Order 1',
              parcel_order_status: 'NEW',
              created_at: '2026-11-16T05:37:00Z',
            },
            {
              id: 'cancelled',
              name: 'Order 1',
              parcel_order_status: 'USER_CANCELLED',
              created_at: '2026-11-16T05:20:00Z',
            },
          ],
        });
      }, calls),
    );

    const found = await client.findOrderByReference('o1', 'Order 1');
    const checked = calls
      .filter((call) => call.url.endsWith('/dynamic/get'))
      .map((call) => call.body.id);

    expect(found?.id).toBe('newest');
    expect(checked).toEqual(['newest']);
    expect(await client.findOrderByReference('o9', 'Order 1')).toBeUndefined();
  });

  it('creates with the quote in cargo.dynamic_price_id', async () => {
    const calls: TCall[] = [];
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        return ok({ id: 'p1', parcel_order_status: 'NEW' });
      }, calls),
    );

    const created = await client.createDynamicOrder({
      quote_id: 'quote1',
      staff_id: 's1',
      reference_id: 'o1',
      car_type: ['PASSANGER_CAR'],
      category_id: 'c1',
      condition_id: 'd1',
      cargo: {
        reference_id: 'o1',
        name: 'Order 1',
        quantity: 1,
        weigth_type: 'BOX',
        other_receive_phone: '99112233',
      },
    });
    const creates = calls
      .filter((call) => call.url.endsWith('/dynamic/create'))
      .map((call) => call.body);
    const cargo = creates[0].cargo as Record<string, unknown>;

    expect(created.id).toBe('p1');
    expect(creates).toHaveLength(1);
    expect(creates[0].quote_id).toBeUndefined();
    expect(cargo.dynamic_price_id).toBe('quote1');
    expect(cargo.schedule_type).toBe('THREE_HOURS');
  });
});

describe('Papa delivery deal steps', () => {
  it('maps Papa statuses to pipeline steps', () => {
    expect(papaDealStep('NEW')).toBeUndefined();
    expect(papaDealStep('FAILED')).toBeUndefined();
    expect(papaDealStep('CONFIRM')).toBe('sent');
    expect(papaDealStep('CREATING_SHIPPING')).toBe('inTransit');
    expect(papaDealStep('START')).toBe('inTransit');
    expect(papaDealStep('END')).toBe('delivered');
    expect(papaDealStep('COMPLETED')).toBe('delivered');
    expect(papaDealStep('USER_CANCELLED')).toBe('cancelled');
    expect(papaDealStep('CANCELLED')).toBe('failed');
    expect(papaDealStep('EXPIRED')).toBe('failed');
  });

  it('moves a deal forward only, and starts over for a resend', () => {
    const sent = { step: 'sent' as const, papaOrderId: 'p1' };
    const delivered = { step: 'delivered' as const, papaOrderId: 'p1' };

    expect(shouldMoveDeal(undefined, 'sent', 'p1')).toBe(true);
    expect(shouldMoveDeal(sent, 'inTransit', 'p1')).toBe(true);
    expect(shouldMoveDeal(sent, 'sent', 'p1')).toBe(false);
    expect(shouldMoveDeal(delivered, 'inTransit', 'p1')).toBe(false);
    expect(shouldMoveDeal(delivered, 'failed', 'p1')).toBe(false);
    expect(shouldMoveDeal(delivered, 'sent', 'p2')).toBe(true);
  });
});

describe('Papa delivery details', () => {
  const driver = { firstname: 'Bat', lastname: 'Dorj', phone: '99112233' };
  const car = { plate: '1234УБА' };
  const at = new Date('2026-11-20T10:00:00Z');
  const later = new Date('2026-11-20T12:00:00Z');

  it('keeps the driver and vehicle after Papa drops them', () => {
    const current = {
      status: 'START',
      driver,
      car,
      updatedAt: at,
    };
    const next = mergeRefreshedDelivery(
      current,
      { status: 'COMPLETED', driver: null, car: null },
      later,
    );

    expect(next.driver).toEqual(driver);
    expect(next.car).toEqual(car);
  });

  it('records when the goods were delivered, once', () => {
    const ended = mergeRefreshedDelivery(
      { status: 'START', updatedAt: at },
      { status: 'END' },
      at,
    );
    const completed = mergeRefreshedDelivery(
      ended,
      { status: 'COMPLETED' },
      later,
    );

    expect(ended.deliveredAt).toEqual(at);
    expect(completed.deliveredAt).toEqual(at);
    expect(completed.closedAt).toBeUndefined();
  });

  it('records when a delivery was cancelled or expired', () => {
    const cancelled = mergeRefreshedDelivery(
      { status: 'CONFIRM', cancelReason: 'Customer called', updatedAt: at },
      { status: 'USER_CANCELLED' },
      later,
    );

    expect(cancelled.closedAt).toEqual(later);
    expect(cancelled.cancelReason).toBe('Customer called');
    expect(cancelled.deliveredAt).toBeUndefined();
  });

  it('reads Papa’s status date, falling back when it is missing', () => {
    const order = { id: 'p1', parcel_order_status: 'END' };

    expect(
      papaStatusDate(
        { ...order, parcel_order_status_date: '2026-11-20T10:00:00Z' },
        later,
      ),
    ).toEqual(at);
    expect(papaStatusDate(order, later)).toEqual(later);
    expect(
      papaStatusDate({ ...order, parcel_order_status_date: 'soon' }, later),
    ).toEqual(later);
    expect(
      papaStatusDate(
        { ...order, parcel_order_status_date: '2026-11-20 18:00:00' },
        later,
      ),
    ).toEqual(later);
  });

  it('writes the receiver, the note and the items into the driver note', () => {
    expect(
      buildDriverNote({
        receiverName: ' Болд ',
        note: 'Call first',
        items: [
          { name: 'Ус', quantity: 2 },
          { name: 'Талх', quantity: 1 },
        ],
      }),
    ).toBe('Хүлээн авагч: Болд\nCall first\nБараа: Ус ×2, Талх ×1');
    expect(buildDriverNote({ items: [] })).toBe('');
  });

  it('shortens the item list first when the note is too long', () => {
    const note = buildDriverNote(
      {
        receiverName: 'Болд',
        items: Array.from({ length: 50 }, (_, index) => ({
          name: `Product ${index}`,
          quantity: 1,
        })),
      },
      80,
    );

    expect(note.length).toBeLessThanOrEqual(80);
    expect(note.startsWith('Хүлээн авагч: Болд\nБараа: Product 0')).toBe(true);
    expect(note.endsWith('…')).toBe(true);
  });
});

describe('Papa delivery report', () => {
  it('counts deliveries still in progress and sums the totals', () => {
    const { rows, totals } = summarizePapaReport([
      {
        period: '2026-11-19',
        sent: 5,
        delivered: 3,
        cancelled: 1,
        failed: 0,
        revenue: 300000,
        papaCost: 30000,
      },
      {
        period: '2026-11-20',
        sent: 2,
        delivered: 1,
        cancelled: 0,
        failed: 1,
        revenue: 50000,
        papaCost: 10000,
      },
    ]);

    expect(rows.map((row) => row.inProgress)).toEqual([1, 0]);
    expect(totals).toEqual({
      sent: 7,
      delivered: 4,
      cancelled: 1,
      failed: 1,
      inProgress: 1,
      revenue: 350000,
      papaCost: 40000,
    });
  });
});

describe('Papa automatic send', () => {
  const locations = [
    { id: 11, name: 'Сүхбаатар дүүрэг' },
    { id: 12, name: 'Хан-Уул дүүрэг' },
    { id: 13, name: 'Баянзүрх дүүрэг' },
    { id: 14, name: 'Баянзүрх', parent_id: 99 },
  ];

  it('matches a checkout district to one Papa location', () => {
    expect(matchPapaLocation('Хан-Уул', locations)).toBe('12');
    expect(matchPapaLocation('сүхбаатар дүүрэг', locations)).toBe('11');
    expect(matchPapaLocation('Баянзүрх', locations)).toBeUndefined();
    expect(matchPapaLocation('', locations)).toBeUndefined();
  });

  it('reads the checkout pin in every agreed shape', () => {
    expect(
      readDeliveryPin({ marker: { latitude: 47.9, longitude: 106.9 } }),
    ).toEqual({ lat: '47.9', lng: '106.9' });
    expect(
      readDeliveryPin({ location: { coordinates: [106.9, 47.9] } }),
    ).toEqual({ lat: '47.9', lng: '106.9' });
    expect(readDeliveryPin({ lat: '47.9', lng: '106.9' })).toEqual({
      lat: '47.9',
      lng: '106.9',
    });
    expect(
      readDeliveryPin({ marker: { latitude: 'x', longitude: 1 } }),
    ).toBeNull();
  });

  it('plans a send from a complete dts.mn checkout', () => {
    const plan = planPapaAutoSend(
      {
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        street: '15-р хороо',
        detail: '5-р байр 12 тоот',
        phone: '+976 9911 2233',
        firstName: 'Бат',
        lastName: 'Дорж',
        callBefore: true,
        marker: { latitude: 47.89, longitude: 106.91 },
      },
      locations,
      'SMALL',
    );

    expect(plan.missing).toEqual([]);
    expect(plan.quote).toEqual({
      toLocationId: '12',
      toAddress: 'Улаанбаатар, Хан-Уул, 15-р хороо, 5-р байр 12 тоот',
      toLatitude: '47.89',
      toLongitude: '106.91',
      size: 'SMALL',
    });
    expect(plan.send).toEqual({
      receiverName: 'Дорж Бат',
      receiverPhone: '99112233',
      description: 'Хүргэхийн өмнө заавал залгах',
    });
  });

  it('lists what a checkout lacks instead of sending', () => {
    const plan = planPapaAutoSend({ district: 'Нүүдэл' }, locations);

    expect(plan.quote).toBeNull();
    expect(plan.missing).toEqual(['district', 'pin', 'phone']);
  });
});
