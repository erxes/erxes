import { describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('exchange rates', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('keeps rates by day and answers the one in force on a day', async () => {
    const owner = t.owner();

    await owner.organizations.update({ currency: 'MNT', timezone: 'Asia/Ulaanbaatar' });

    const january = await owner.exchangeRates.create({
      date: '2026-01-01',
      rateCurrency: 'usd',
      rate: 3400,
    });

    expect(january).toMatchObject({ date: '2026-01-01', mainCurrency: 'MNT', rateCurrency: 'USD' });

    await owner.exchangeRates.create({ date: '2026-02-01', rateCurrency: 'USD', rate: 3450.5 });
    await owner.exchangeRates.create({ date: '2026-01-15', rateCurrency: 'EUR', rate: 3900 });
    await owner.exchangeRates.create({
      date: '2026-01-10',
      mainCurrency: 'USD',
      rateCurrency: 'EUR',
      rate: 1.1,
    });

    const active = (date: string, rateCurrency = 'USD', mainCurrency?: string) =>
      owner.exchangeRates.getActiveRate({ date, rateCurrency, mainCurrency });

    // The latest rate of the pair starting on the day or before; none before the first.
    expect((await active('2026-01-31'))?.rate).toBe(3400);
    expect((await active('2026-02-01'))?.rate).toBe(3450.5);
    expect((await active('2026-12-31'))?.rate).toBe(3450.5);
    expect(await active('2025-12-31')).toBeNull();
    expect((await active('2026-01-20', 'EUR'))?.rate).toBe(3900);
    expect((await active('2026-01-20', 'EUR', 'USD'))?.rate).toBe(1.1);
    expect(await active('2026-01-20', 'GBP')).toBeNull();

    // A moment counts on its day in the organisation's time zone (UTC+8).
    expect((await active('2026-01-31T17:00:00.000Z'))?.rate).toBe(3450.5);
    expect((await active('2026-01-31T15:00:00.000Z'))?.rate).toBe(3400);

    // One rate per pair and day; the pair needs two currencies; rates are positive.
    await expect(
      owner.exchangeRates.create({ date: '2026-01-01', rateCurrency: 'USD', rate: 1 }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'date' } });
    await expect(
      owner.exchangeRates.create({ date: '2026-03-01', rateCurrency: 'MNT', rate: 1 }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      owner.exchangeRates.create({ date: '2026-03-01', rateCurrency: 'USD', rate: 0 }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      owner.exchangeRates.update({ id: january.id, mainCurrency: 'USD' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const changed = await owner.exchangeRates.update({ id: january.id, rate: 3410 });

    expect(changed.rate).toBe(3410);
    expect((await active('2026-01-31'))?.rate).toBe(3410);
  });

  it('lists newest first, searches either currency and deletes', async () => {
    const owner = t.owner();
    const list = await owner.exchangeRates.list({});

    expect(list.data.map((rate) => rate.date)).toEqual([
      '2026-01-10',
      '2026-01-15',
      '2026-02-01',
      '2026-01-01',
    ]);
    expect(list.totalCount).toBe(4);
    expect((await owner.exchangeRates.list({ searchValue: 'eu' })).totalCount).toBe(2);
    expect((await owner.exchangeRates.list({ rateCurrency: 'USD' })).totalCount).toBe(2);
    expect(
      (await owner.exchangeRates.list({ rateCurrency: 'USD', date: '2026-02-01' })).data,
    ).toHaveLength(1);

    const euros = (await owner.exchangeRates.list({ rateCurrency: 'EUR' })).data;

    expect(await owner.exchangeRates.remove({ ids: euros.map((rate) => rate.id) })).toEqual({
      removed: 2,
    });
    expect((await owner.exchangeRates.list({})).totalCount).toBe(2);
  });

  it('lets members read, managers change, and plugins read and write with their scopes', async () => {
    expect((await t.member().exchangeRates.list({})).totalCount).toBe(2);
    expect(
      (await t.member().exchangeRates.getActiveRate({ date: '2026-06-01', rateCurrency: 'USD' }))
        ?.rate,
    ).toBe(3450.5);
    await expect(
      t.member().exchangeRates.create({ date: '2026-06-01', rateCurrency: 'USD', rate: 3500 }),
    ).rejects.toMatchObject({ status: 403 });

    // The test plugin holds every scope; it reads the rate a transaction's day takes.
    const hr = t.hr();

    expect(
      (await hr.exchangeRates.getActiveRate({ date: '2026-06-01T00:00:00Z', rateCurrency: 'USD' }))
        ?.rate,
    ).toBe(3450.5);

    const added = await hr.exchangeRates.create({
      date: '2026-06-01',
      rateCurrency: 'USD',
      rate: 3500,
    });

    expect((await hr.exchangeRates.update({ id: added.id, rate: 3510 })).rate).toBe(3510);

    // A plugin that asked only to read can't write.
    const secret = await rotatePluginSecret('tms');

    const token = async (org?: string) =>
      (
        await t.client().plugins.token({
          grant_type: 'client_credentials',
          client_id: 'tms',
          client_secret: secret,
          org,
        })
      ).access_token;

    await t.client(await token()).plugins.registerManifest({
      title: 'TMS',
      version: '1',
      scopes: ['exchange_rates:read'],
    });

    const tms = t.client(await token(t.ids.org));

    expect((await tms.exchangeRates.list({})).totalCount).toBe(3);
    await expect(tms.exchangeRates.remove({ ids: [added.id] })).rejects.toMatchObject({
      status: 403,
    });

    // The other organisation sees none of them.
    expect((await t.other().exchangeRates.list({})).totalCount).toBe(0);
    expect(
      await t.other().exchangeRates.getActiveRate({ date: '2026-06-01', rateCurrency: 'USD' }),
    ).toBeNull();
    await expect(t.other().exchangeRates.update({ id: added.id, rate: 1 })).rejects.toMatchObject({
      status: 404,
    });
  });
});
