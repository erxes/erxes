import { describe, expect, it } from 'vite-plus/test';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** Conditions mean what the same filter means in a list: the record's company, nested groups, the event. */
describe('automation conditions', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  /** A customer working at a new company of `industry` with `size` people. */
  const staffOf = async (firstName: string, industry: string, size: number) => {
    const owner = t.owner();

    const company = await owner.companies.create({
      primaryName: `${industry} LLC`,
      industry,
      size,
    });

    const person = await owner.customers.create({ firstName });

    await owner.companies.linkPerson({ id: company.id, customerId: person.id });

    return person.id;
  };

  it("starts on the record's company, and branches on it", async () => {
    const miner = await staffOf('Miner', 'Mining', 300);
    const grocer = await staffOf('Grocer', 'Retail', 12);
    const loner = (await t.owner().customers.create({ firstName: 'Loner' })).id;

    const id = await t.active('Mining staff', {
      trigger: {
        kind: 'manual',
        audience: {
          type: 'customer',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.company.industry', op: 'eq', value: 'Mining' }],
          },
        },
      },
      steps: [
        {
          id: 'size',
          type: 'branch',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.company.size', op: 'gt', value: 100 }],
          },
          then: [{ id: 'big', type: 'stop' }],
          else: [{ id: 'small', type: 'stop' }],
        },
      ],
    });

    expect(await t.owner().automations.start({ id, subjects: [miner, grocer, loner] })).toEqual({
      started: 1,
      skipped: 2,
      continuing: false,
    });
    await settle();

    const [run, ...others] = await t.runsOf(id);

    expect(others).toEqual([]);
    expect(run).toMatchObject({ subjectId: miner, status: 'succeeded' });
    expect(await t.stepsOf(run?.id ?? '')).toEqual(['size', 'big']);
  });

  it('mixes rules on the event and on the record in nested any and all groups', async () => {
    const id = await t.active('Ann or a keeper', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'any',
          rules: [
            {
              match: 'all',
              rules: [
                { path: 'event.type', op: 'eq', value: 'core.customer.created' },
                { path: 'subject.firstName', op: 'eq', value: 'Ann' },
              ],
            },
            {
              match: 'all',
              rules: [
                { path: 'event.type', op: 'eq', value: 'core.company.created' },
                { path: 'subject.firstName', op: 'eq', value: 'Bob' },
              ],
            },
            { path: 'subject.lastName', op: 'eq', value: 'Keep' },
          ],
        },
      },
      steps: [{ id: 'stop', type: 'stop' }],
    });

    const owner = t.owner();
    const ann = await owner.customers.create({ firstName: 'Ann' });

    await owner.customers.create({ firstName: 'Bob' });

    const keeper = await owner.customers.create({ firstName: 'Cid', lastName: 'Keep' });

    await owner.customers.create({ firstName: 'Dan' });
    await settle();

    const started = (await t.runsOf(id)).map((run) => run.subjectId);

    expect(started).toHaveLength(2);
    expect(started).toEqual(expect.arrayContaining([ann.id, keeper.id]));
  });

  it('enrolls only the matching records of a large audience, filtered by the database', async () => {
    const owner = t.owner();
    const wanted = await staffOf('Wanted', 'Shipping', 40);

    await Promise.all(
      Array.from({ length: 30 }, (_, at) => owner.customers.create({ firstName: `Other ${at}` })),
    );

    const id = await t.active('Shipping', {
      trigger: {
        kind: 'manual',
        audience: {
          type: 'customer',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.company.industry', op: 'eq', value: 'Shipping' }],
          },
        },
      },
      steps: [{ id: 'stop', type: 'stop' }],
    });

    expect(await owner.automations.start({ id })).toEqual({
      started: 1,
      skipped: 0,
      continuing: false,
    });
    await settle();
    expect((await t.runsOf(id)).map((run) => run.subjectId)).toEqual([wanted]);
  });

  it('refuses conditions on fields the record lacks, and dry-runs company conditions', async () => {
    const { id } = await t.owner().automations.create({
      name: 'Typo',
      definition: {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.companyIndustry', op: 'eq', value: 'Mining' }],
          },
        },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    await expect(t.owner().automations.activate({ id })).rejects.toMatchObject({
      code: 'INVALID_AUTOMATION',
    });

    await t.owner().automations.update({
      id,
      definition: {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.company.industry', op: 'eq', value: 'Farming' }],
          },
        },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    const farmer = await staffOf('Farmer', 'Farming', 5);

    const test = (subjectId: string) =>
      t.owner().automations.test({ id, subjectType: 'customer', subjectId });

    expect(await test(farmer)).toMatchObject({ triggerMatches: true });
    expect(await test(await staffOf('Baker', 'Bakery', 3))).toMatchObject({
      triggerMatches: false,
    });
  });
});
