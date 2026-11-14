import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const idsOf = (rows: { id: string }[]) => rows.map((row) => row.id);

describe('leads: stages, moves, conversion, history and the report', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const stages = async () => (await t.owner().leads.stages({})).data;

  const stage = async (name: string) => {
    const found = (await stages()).find((item) => item.name === name);

    if (!found) throw new Error(`no stage ${name}`);

    return found;
  };

  it('starts every organisation with stages, and new leads in the first open one with their source', async () => {
    expect((await stages()).map((item) => [item.name, item.kind])).toEqual([
      ['New', 'open'],
      ['Contacted', 'open'],
      ['Engaged', 'open'],
      ['Qualified', 'qualified'],
      ['Disqualified', 'disqualified'],
    ]);

    const fresh = await stage('New');

    const lead = await t.owner().customers.create({
      firstName: 'Bat',
      state: 'lead',
      source: 'Website',
      sourceDetails: { campaign: 'spring' },
    });

    expect(lead).toMatchObject({
      leadStageId: fresh.id,
      source: 'website',
      sourceDetails: { campaign: 'spring' },
      convertedAt: null,
    });
    expect((await t.owner().customers.create({ firstName: 'Dorj', state: 'lead' })).source).toBe(
      'manual',
    );
    // Customers have a source but no stage.
    expect(await t.owner().customers.create({ firstName: 'Saraa' })).toMatchObject({
      source: 'manual',
      leadStageId: null,
    });
    await expect(
      t.owner().customers.create({ firstName: 'X', leadStageId: fresh.id }),
    ).rejects.toMatchObject({ code: 'NOT_A_LEAD' });
    expect((await stage('New')).leadCount).toBe(2);
  });

  it('moves leads, asks why when disqualifying, converts them and keeps the journey', async () => {
    const leads = (await t.owner().customers.list({ state: 'lead' })).data;
    const bat = leads.find((lead) => lead.firstName === 'Bat')?.id ?? '';
    const dorj = leads.find((lead) => lead.firstName === 'Dorj')?.id ?? '';
    const contacted = await stage('Contacted');

    expect(await t.owner().leads.move({ ids: [bat], stageId: contacted.id })).toEqual({
      moved: 1,
    });
    expect(
      await t.owner().leads.move({
        ids: [dorj],
        stageId: (await stage('Disqualified')).id,
        reason: 'No budget',
      }),
    ).toEqual({ moved: 1 });
    expect((await t.owner().customers.get({ id: dorj })).disqualifyReason).toBe('No budget');
    // The stage tab.
    expect(
      idsOf((await t.owner().customers.list({ state: 'lead', leadStageId: contacted.id })).data),
    ).toEqual([bat]);

    // The advanced filter names stages.
    const filter = JSON.stringify({
      match: 'all',
      rules: [{ path: 'subject.leadStageId', op: 'eq', value: 'disqualified' }],
    });

    expect(idsOf((await t.owner().customers.list({ state: 'lead', filter })).data)).toEqual([dorj]);

    const company = (await t.owner().companies.create({ primaryName: 'Nomad LLC' })).id;
    const ownerId = t.ids.owner;

    expect(await t.owner().leads.convert({ ids: [bat], companyId: company, ownerId })).toEqual({
      converted: 1,
    });

    const converted = await t.owner().customers.get({ id: bat });

    expect(converted).toMatchObject({
      state: 'customer',
      ownerId,
      leadStageId: (await stage('Qualified')).id,
    });
    expect(converted.convertedAt).toEqual(expect.any(String));
    expect(idsOf((await t.owner().customers.companies({ id: bat })).data)).toEqual([company]);
    // Customers are not leads any more.
    await expect(
      t.owner().leads.move({ ids: [bat], stageId: (await stage('New')).id }),
    ).rejects.toMatchObject({ code: 'NOT_A_LEAD' });

    const history = await t.owner().leads.history({ id: bat });

    expect(history.data.map((entry) => entry.event)).toEqual(['created', 'stage', 'converted']);

    // Back to a lead: the first open stage again.
    expect(await t.owner().customers.update({ id: bat, state: 'lead' })).toMatchObject({
      state: 'lead',
      convertedAt: null,
      leadStageId: (await stage('New')).id,
    });

    // The timeline tells the story.
    const timeline = await t.owner().activities.list({ targetType: 'customer', targetId: bat });

    expect(
      timeline.data
        .filter((entry) => entry.type === 'customer.lead')
        .map((entry) => String(entry.data.event))
        .toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['converted', 'reopened', 'stage']);
  });

  it('reports the funnel, sources and reasons', async () => {
    const report = await t.owner().leads.report({});

    expect(report).toMatchObject({
      created: 2,
      converted: 1,
      disqualified: 1,
      conversionRate: 0,
    });
    expect(report.stages.find((item) => item.name === 'Contacted')).toMatchObject({
      reached: 1,
      current: 0,
    });
    expect(report.bySource).toContainEqual({ source: 'website', count: 1, converted: 0 });
    expect(report.bySource).toContainEqual({ source: 'manual', count: 1, converted: 0 });
    expect(report.reasons).toEqual([{ reason: 'No budget', count: 1 }]);
    expect(report.daysToConvert.median).toEqual(expect.any(Number));
  });

  it('takes companies through the same stages', async () => {
    const lead = await t
      .owner()
      .companies.create({ primaryName: 'Lead Co', state: 'lead', source: 'event' });

    expect(lead).toMatchObject({
      state: 'lead',
      leadStageId: (await stage('New')).id,
      source: 'event',
    });
    expect((await stage('New')).companyLeadCount).toBe(1);
    expect(idsOf((await t.owner().companies.list({ state: 'lead' })).data)).toEqual([lead.id]);

    const ids = [lead.id];

    expect(
      await t
        .owner()
        .leads.move({ recordType: 'company', ids, stageId: (await stage('Engaged')).id }),
    ).toEqual({ moved: 1 });
    await expect(
      t.owner().leads.convert({ recordType: 'company', ids, companyId: lead.id }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    expect(await t.owner().leads.convert({ recordType: 'company', ids })).toEqual({
      converted: 1,
    });
    expect(await t.owner().companies.get({ id: lead.id })).toMatchObject({
      state: 'customer',
      leadStageId: (await stage('Qualified')).id,
    });

    const history = await t.owner().leads.history({ id: lead.id, recordType: 'company' });

    expect(history.data.map((entry) => entry.event)).toEqual(['created', 'stage', 'converted']);
    expect(await t.owner().leads.report({ recordType: 'company' })).toMatchObject({
      recordType: 'company',
      created: 1,
      converted: 1,
    });
  });

  it('moves and converts many leads at once, from different stages', async () => {
    const ids = await Promise.all(
      ['Ganaa', 'Tuya', 'Oyun'].map(
        async (firstName) => (await t.owner().customers.create({ firstName, state: 'lead' })).id,
      ),
    );

    const [ganaa = '', tuya = ''] = ids;
    const qualified = await stage('Qualified');

    expect(
      await t
        .owner()
        .leads.move({ ids, stageId: (await stage('Disqualified')).id, reason: 'Spam' }),
    ).toEqual({ moved: 3 });
    expect(await t.owner().leads.move({ ids: [tuya], stageId: qualified.id })).toEqual({
      moved: 1,
    });

    const company = (await t.owner().companies.create({ primaryName: 'Steppe LLC' })).id;

    expect(
      await t.owner().leads.convert({ ids, companyId: company, ownerId: t.ids.member }),
    ).toEqual({ converted: 3 });

    for (const id of ids) {
      expect(await t.owner().customers.get({ id })).toMatchObject({
        state: 'customer',
        ownerId: t.ids.member,
        leadStageId: qualified.id,
        disqualifyReason: null,
      });
      expect(idsOf((await t.owner().customers.companies({ id })).data)).toEqual([company]);
    }

    expect((await t.owner().leads.history({ id: ganaa })).data.map((entry) => entry.event)).toEqual(
      ['created', 'stage', 'converted'],
    );
    expect((await t.owner().leads.history({ id: tuya })).data.at(-1)).toMatchObject({
      event: 'converted',
      fromStageId: qualified.id,
      toStageId: qualified.id,
    });

    const assigned = await t.member().notifications.list({ kind: 'core.customer.assigned' });

    expect(assigned.data).toHaveLength(3);
    expect(assigned.data.map((item) => item.entityId)).toEqual(expect.arrayContaining(ids));
  });

  it('links people to companies with a role, a main contact and an end', async () => {
    const company = (await t.owner().companies.create({ primaryName: 'People Co' })).id;
    const anna = (await t.owner().customers.create({ firstName: 'Anna' })).id;
    const tuya = (await t.owner().customers.create({ firstName: 'Tuya' })).id;

    await t.owner().companies.linkPerson({
      id: company,
      customerId: anna,
      role: 'CEO',
      isPrimaryContact: true,
    });
    await t.owner().customers.linkCompany({ id: tuya, companyId: company, role: 'Buyer' });

    const people = async () =>
      (await t.owner().companies.people({ id: company })).data.map((person) => [
        person.firstName,
        person.link.role,
        person.link.isPrimaryContact,
        Boolean(person.link.endedAt),
      ]);

    expect(await people()).toEqual([
      ['Anna', 'CEO', true, false],
      ['Tuya', 'Buyer', false, false],
    ]);
    // Taking the main contact moves it; leaving keeps the link as history, last.
    await t.owner().companies.linkPerson({ id: company, customerId: tuya, isPrimaryContact: true });
    await t.owner().companies.linkPerson({ id: company, customerId: anna, ended: true });
    expect(await people()).toEqual([
      ['Tuya', 'Buyer', true, false],
      ['Anna', 'CEO', false, true],
    ]);
    expect((await t.owner().customers.companies({ id: tuya })).data[0]).toMatchObject({
      id: company,
      link: { role: 'Buyer', isPrimaryContact: true },
    });
    await t.owner().companies.unlinkPerson({ id: company, customerId: anna });
    expect((await people()).map((row) => row[0])).toEqual(['Tuya']);
  });

  it('manages stages: add, rename, reorder, and delete only with somewhere for its leads to go', async () => {
    const created = await t.owner().leads.createStage({ name: 'Demo booked', color: '#0ea5e9' });

    await expect(t.owner().leads.createStage({ name: 'demo BOOKED' })).rejects.toMatchObject({
      code: 'TAKEN',
    });

    await t.owner().leads.reorderStages({ ids: idsOf(await stages()).toReversed() });
    expect((await stages())[0]?.name).toBe('Demo booked');

    const fresh = await stage('New');

    expect(fresh.leadCount).toBe(1);
    await expect(t.owner().leads.removeStage({ id: fresh.id })).rejects.toMatchObject({
      code: 'LEAD_STAGE_IN_USE',
    });
    expect(await t.owner().leads.removeStage({ id: fresh.id, moveTo: created.id })).toEqual({
      moved: 1,
    });
    expect((await stage('Demo booked')).leadCount).toBe(1);

    // One open stage must stay: new leads start there.
    const others = (await stages()).filter((row) => row.kind === 'open' && row.id !== created.id);

    for (const item of others) await t.owner().leads.removeStage({ id: item.id });

    await expect(
      t.owner().leads.removeStage({ id: created.id, moveTo: (await stage('Qualified')).id }),
    ).rejects.toMatchObject({ code: 'LAST_OPEN_STAGE' });
    await expect(
      t.owner().leads.updateStage({ id: created.id, kind: 'qualified' }),
    ).rejects.toMatchObject({ code: 'LAST_OPEN_STAGE' });
  });
});
