import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

describe('automation contracts healed by real data', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  let plugin: Server;
  let apiUrl = '';

  beforeAll(() => {
    plugin = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ ticketId: 't1', number: '42', urgent: true, nested: { a: 1 } }));
      });
    }).listen(0);

    const address = plugin.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    apiUrl = `http://127.0.0.1:${address.port}/api`;
  });

  afterAll(() => {
    plugin.close();
  });

  const catalog = () => t.owner().automations.catalog({});

  const outputsOf = async () =>
    (await catalog()).actions.find((item) => item.type === 'hr.ticket.create')?.outputs;

  it('fixes a declared type the events contradict, and offers events the plugin never declared', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '4.0.0',
      scopes: ['events:write'],
      events: [
        {
          type: 'hr.leave.approved',
          label: 'Leave approved',
          fields: [
            { key: 'days', label: 'Days', type: 'number' },
            { key: 'approved', label: 'Approved', type: 'boolean' },
          ],
        },
      ],
    });

    await t.hr().events.publish({
      events: [
        { type: 'hr.leave.approved', payload: { days: 'three', approved: ['yes'], note: 'ok' } },
        { type: 'hr.badge.scanned', payload: { door: 'Front', count: 2 } },
      ],
    });
    await settle();

    const { triggers } = await catalog();

    expect(triggers.find((item) => item.type === 'hr.leave.approved')?.fields).toEqual([
      { key: 'days', label: 'Days', type: 'text' },
      { key: 'approved', label: 'Approved', type: 'list' },
      { key: 'note', label: 'Note', type: 'text' },
    ]);
    expect(triggers.find((item) => item.type === 'hr.badge.scanned')).toMatchObject({
      label: 'Badge scanned',
      source: 'hr',
      seen: true,
      fields: [
        { key: 'count', label: 'Count', type: 'number' },
        { key: 'door', label: 'Door', type: 'text' },
      ],
    });

    const other = await t.other().automations.catalog({});

    expect(other.triggers.some((item) => item.type === 'hr.badge.scanned')).toBe(false);
  });

  it("learns a plugin action's outputs from what it answers", async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '4.1.0',
      scopes: ['events:write'],
      api: { url: apiUrl },
      events: [{ type: 'hr.leave.approved', label: 'Leave approved' }],
      actions: [
        {
          type: 'hr.ticket.create',
          label: 'Create ticket',
          fields: [],
          outputs: [{ key: 'number', label: 'Ticket number', type: 'number' }],
        },
      ],
    });

    expect(await outputsOf()).toEqual([{ key: 'number', label: 'Ticket number', type: 'number' }]);

    const id = await t.active('Ticket on leave', {
      trigger: { kind: 'event', event: 'hr.leave.approved' },
      steps: [{ id: 'ticket', type: 'action', action: 'hr.ticket.create', input: {} }],
    });

    await t.hr().events.publish({ events: [{ type: 'hr.leave.approved', payload: {} }] });
    await settle();

    expect((await t.runsOf(id)).map((run) => run.status)).toEqual(['succeeded']);
    expect(await outputsOf()).toEqual([
      { key: 'number', label: 'Ticket number', type: 'text' },
      { key: 'ticketId', label: 'Ticket id', type: 'text' },
      { key: 'urgent', label: 'Urgent', type: 'boolean' },
    ]);
  });
});
