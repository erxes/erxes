import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';

describeWithDb('leads: stages, moves, conversion, history and the report', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let owner = '';
  let ownerId = '';

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${owner}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  type Stage = { id: string; name: string; kind: string; leadCount: number };
  const stages = async () => (await call('GET', '/lead-stages')).body.data as Stage[];
  const stage = async (name: string) => (await stages()).find((item) => item.name === name)!;

  beforeAll(async () => {
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'o@acme.mn' } });

    ownerId = acme.owner.id;
    owner = await currentToken(ownerId, acme.organization.id);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('starts every organisation with stages, and new leads in the first open one with their source', async () => {
    expect((await stages()).map((item) => [item.name, item.kind])).toEqual([
      ['New', 'open'],
      ['Contacted', 'open'],
      ['Engaged', 'open'],
      ['Qualified', 'qualified'],
      ['Disqualified', 'disqualified'],
    ]);

    const lead = await call('POST', '/customers', { firstName: 'Bat', state: 'lead', source: 'Website', sourceDetails: { campaign: 'spring' } });

    expect(lead.status).toBe(201);
    expect(lead.body).toMatchObject({ leadStageId: (await stage('New')).id, source: 'website', sourceDetails: { campaign: 'spring' }, convertedAt: null });
    expect((await call('POST', '/customers', { firstName: 'Dorj', state: 'lead' })).body.source).toBe('manual');
    // Customers have a source but no stage.
    expect((await call('POST', '/customers', { firstName: 'Saraa' })).body).toMatchObject({ source: 'manual', leadStageId: null });
    expect((await call('POST', '/customers', { firstName: 'X', leadStageId: (await stage('New')).id })).body.code).toBe('NOT_A_LEAD');
    expect((await stage('New')).leadCount).toBe(2);
  });

  it('moves leads, asks why when disqualifying, converts them and keeps the journey', async () => {
    const leads = (await call('GET', '/customers?state=lead')).body.data as { id: string; firstName: string }[];
    const bat = leads.find((lead) => lead.firstName === 'Bat')!.id;
    const dorj = leads.find((lead) => lead.firstName === 'Dorj')!.id;

    expect((await call('POST', '/leads/move', { ids: [bat], stageId: (await stage('Contacted')).id })).body).toEqual({ moved: 1 });
    expect((await call('POST', '/leads/move', { ids: [dorj], stageId: (await stage('Disqualified')).id, reason: 'No budget' })).body).toEqual({ moved: 1 });
    expect((await call('GET', `/customers/${dorj}`)).body.disqualifyReason).toBe('No budget');
    // The stage tab.
    expect((await call('GET', `/customers?state=lead&leadStageId=${(await stage('Contacted')).id}`)).body.data.map((row: { id: string }) => row.id)).toEqual([bat]);
    // The advanced filter names stages.
    const filter = encodeURIComponent(JSON.stringify({ match: 'all', rules: [{ path: 'subject.leadStageId', op: 'eq', value: 'disqualified' }] }));

    expect((await call('GET', `/customers?state=lead&filter=${filter}`)).body.data.map((row: { id: string }) => row.id)).toEqual([dorj]);

    const company = (await call('POST', '/companies', { primaryName: 'Nomad LLC' })).body.id;

    expect((await call('POST', '/leads/convert', { ids: [bat], companyId: company, ownerId })).body).toEqual({ converted: 1 });

    const converted = (await call('GET', `/customers/${bat}`)).body;

    expect(converted).toMatchObject({ state: 'customer', ownerId, leadStageId: (await stage('Qualified')).id });
    expect(converted.convertedAt).toEqual(expect.any(String));
    expect((await call('GET', `/customers/${bat}/companies`)).body.data.map((row: { id: string }) => row.id)).toEqual([company]);
    // Customers are not leads any more.
    expect((await call('POST', '/leads/move', { ids: [bat], stageId: (await stage('New')).id })).body.code).toBe('NOT_A_LEAD');

    const history = (await call('GET', `/leads/${bat}/history`)).body.data as { event: string }[];

    expect(history.map((entry) => entry.event)).toEqual(['created', 'stage', 'converted']);

    // Back to a lead: the first open stage again.
    const reopened = (await call('PATCH', `/customers/${bat}`, { state: 'lead' })).body;

    expect(reopened).toMatchObject({ state: 'lead', convertedAt: null, leadStageId: (await stage('New')).id });

    // The timeline tells the story.
    const timeline = (await call('GET', `/activities?targetType=customer&targetId=${bat}`)).body.data as { type: string; data: { event: string } }[];

    expect(timeline.filter((entry) => entry.type === 'customer.lead').map((entry) => entry.data.event).sort()).toEqual(['converted', 'reopened', 'stage']);
  });

  it('reports the funnel, sources and reasons', async () => {
    const report = (await call('GET', '/leads/report')).body;

    expect(report).toMatchObject({ created: 2, converted: 1, disqualified: 1, conversionRate: 0 });
    expect(report.stages.find((item: { name: string }) => item.name === 'Contacted')).toMatchObject({ reached: 1, current: 0 });
    expect(report.bySource).toEqual(expect.arrayContaining([{ source: 'website', count: 1, converted: 0 }, { source: 'manual', count: 1, converted: 0 }]));
    expect(report.reasons).toEqual([{ reason: 'No budget', count: 1 }]);
    expect(report.daysToConvert.median).toEqual(expect.any(Number));
  });

  it('manages stages: add, rename, reorder, and delete only with somewhere for its leads to go', async () => {
    const created = await call('POST', '/lead-stages', { name: 'Demo booked', color: '#0ea5e9' });

    expect(created.status).toBe(201);
    expect((await call('POST', '/lead-stages', { name: 'demo BOOKED' })).body.code).toBe('LEAD_STAGE_EXISTS');

    const ids = (await stages()).map((item) => item.id);

    expect((await call('POST', '/lead-stages/reorder', { ids: [...ids].reverse() })).status).toBe(200);
    expect((await stages())[0]!.name).toBe('Demo booked');

    const fresh = await stage('New');

    expect(fresh.leadCount).toBe(1);
    expect((await call('POST', `/lead-stages/${fresh.id}/remove`, {})).body.code).toBe('LEAD_STAGE_IN_USE');
    expect((await call('POST', `/lead-stages/${fresh.id}/remove`, { moveTo: created.body.id })).body).toEqual({ moved: 1 });
    expect((await stage('Demo booked')).leadCount).toBe(1);

    // One open stage must stay: new leads start there.
    for (const item of (await stages()).filter((row) => row.kind === 'open' && row.id !== created.body.id)) {
      expect((await call('POST', `/lead-stages/${item.id}/remove`, {})).status).toBe(200);
    }

    expect((await call('POST', `/lead-stages/${created.body.id}/remove`, { moveTo: (await stage('Qualified')).id })).body.code).toBe('LAST_OPEN_STAGE');
    expect((await call('PATCH', `/lead-stages/${created.body.id}`, { kind: 'qualified' })).body.code).toBe('LAST_OPEN_STAGE');
  });
});
