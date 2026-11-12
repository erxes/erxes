import {
  IPapaTokenStore,
  PapaApiError,
  PapaClient,
  TPapaFetch,
} from '../client';
import {
  buildCallbackUrl,
  buildDynamicCreateInput,
  expandCarTypes,
  normalizeMnPhone,
  orderToDelivery,
} from '../mapping';

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

  it('retries the quote in the table shape when Papa refuses the example', async () => {
    const calls: TCall[] = [];
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/point/elastic')) return ok([{ id: 'point1' }]);
        return call.body.to_point_id ? refused : ok({ id: 'quote2' });
      }, calls),
    );

    const quote = await client.quote(quoteInput);

    expect(quote.id).toBe('quote2');
    expect(calls[calls.length - 1].body).toEqual(quoteInput);
  });

  it('explains a location with no Papa point near it', async () => {
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        if (call.url.endsWith('/point/elastic')) return ok([]);
        return refused;
      }, []),
    );

    await expect(client.quote(quoteInput)).rejects.toThrow('no delivery point');
  });

  it('creates with the quote in cargo.dynamic_price_id, else top-level', async () => {
    const calls: TCall[] = [];
    let attempt = 0;
    const client = new PapaClient(
      credentials,
      new MemoryStore(),
      fakeFetch((call) => {
        if (call.url.endsWith('/auth/token')) return ok({ access_token: 't' });
        attempt += 1;
        return attempt === 1
          ? refused
          : ok({ id: 'p1', parcel_order_status: 'NEW' });
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
    const [first, second] = calls
      .filter((call) => call.url.endsWith('/dynamic/create'))
      .map((call) => call.body);

    expect(created.id).toBe('p1');
    expect(first.quote_id).toBeUndefined();
    expect((first.cargo as Record<string, unknown>).dynamic_price_id).toBe(
      'quote1',
    );
    expect(second.quote_id).toBe('quote1');
  });
});
