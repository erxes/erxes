import { automationRuns } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { type DefinitionInput, useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';

const INVOICE_ACTIONS = ['test.invoice.create', 'test.invoice.cancel', 'test.invoice.refund'];

/** Bills a new customer called `firstName` through the Test gateway, then notes the pay code. */
const billing = (firstName: string): DefinitionInput => ({
  trigger: {
    kind: 'event',
    event: 'core.customer.created',
    conditions: {
      match: 'all',
      rules: [{ path: 'subject.firstName', op: 'eq', value: firstName }],
    },
  },
  steps: [
    {
      id: 'bill',
      type: 'action',
      action: 'test.invoice.create',
      input: { amount: 150_000, description: 'Welcome pack' },
    },
    {
      id: 'note',
      type: 'action',
      action: 'core.note.add',
      input: { body: 'Pay {{steps.bill.output.qrText}} for {{steps.bill.output.invoiceId}}' },
    },
  ],
});

/** What core's integrations and the plugins' bring to automations, and how a run uses them. */
describe('integration actions', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const gatewayActions = async (client = t.owner()) =>
    (await client.automations.catalog({})).actions.filter(
      (action) => action.integration === 'test',
    );

  it('lists a gateway’s invoice actions only while it is connected here', async () => {
    expect(await gatewayActions()).toEqual([]);

    const gateway = await t.owner().integrations.connect({ key: 'test', name: 'Till', keys: {} });
    const listed = await gatewayActions();

    expect(listed.map((action) => action.type)).toEqual(INVOICE_ACTIONS);
    expect(listed[0]).toMatchObject({ source: 'core', integrationName: 'Test' });
    expect(listed[0]?.fields.find((field) => field.type === 'connection')?.options).toEqual([
      { value: gateway.id, label: 'Till' },
    ]);
    expect(
      (await t.owner().integrations.list()).data
        .find((integration) => integration.key === 'test')
        ?.actions.map((action) => action.type),
    ).toEqual(INVOICE_ACTIONS);
    expect(await gatewayActions(t.other())).toEqual([]);

    await t.owner().integrations.update({ key: 'test', id: gateway.id, status: 'disabled' });
    expect(await gatewayActions()).toEqual([]);

    await t.owner().integrations.update({ key: 'test', id: gateway.id, status: 'active' });
  });

  it('creates a real invoice for the run’s customer, hands its outputs on, and makes it once on a rerun', async () => {
    const id = await t.active('Bill new customers', billing('Payer'));
    const customer = await t.owner().customers.create({ firstName: 'Payer' });

    await settle();

    const invoicesOf = async () =>
      (await t.owner().payments.invoices({ referenceId: customer.id })).data;

    const [invoice, ...more] = await invoicesOf();
    const [run] = await t.runsOf(id);

    expect(more).toEqual([]);
    expect(run?.status).toBe('succeeded');
    expect(invoice).toMatchObject({
      status: 'pending',
      amount: 150_000,
      description: 'Welcome pack',
      referenceType: 'customer',
      gatewayKind: 'test',
    });

    const runId = run?.id ?? '';
    const invoiceId = invoice?.id ?? '';
    const { steps } = await t.owner().automations.run({ runId });

    expect(steps.find((step) => step.stepId === 'bill')?.output).toMatchObject({
      invoiceId,
      amount: 150_000,
      qrText: `TEST:${invoiceId}`,
    });
    expect(steps.find((step) => step.stepId === 'note')?.input).toEqual({
      body: `Pay TEST:${invoiceId} for ${invoiceId}`,
    });

    // As if the run had failed at the invoice step after the gateway answered: a retry runs it again.
    await adminDb()
      .update(automationRuns)
      .set({ status: 'failed', cursor: [0] })
      .where(eq(automationRuns.id, runId));
    await t.owner().automations.retryRun({ runId });
    await makeDue();
    await settle();

    expect((await invoicesOf()).map((item) => item.id)).toEqual([invoiceId]);
    expect((await t.runsOf(id))[0]?.status).toBe('succeeded');
  });

  it('fails the step at once, saying so, when the gateway is no longer connected', async () => {
    const id = await t.active('Bill later', billing('Late'));
    const [gateway] = (await t.owner().integrations.connections({ key: 'test' })).data;

    await t.owner().integrations.update({ key: 'test', id: gateway?.id ?? '', status: 'disabled' });
    await t.owner().customers.create({ firstName: 'Late' });
    await settle();

    expect((await t.runsOf(id))[0]).toMatchObject({
      status: 'failed',
      error: 'Test is not connected: connect it in Settings › Integrations',
    });
  });

  it('groups a plugin’s action under the integration it names, and refuses one it does not declare', async () => {
    const facebook = {
      key: 'facebook',
      name: 'Facebook',
      summary: 'Messenger and page comments in the inbox',
      category: 'social',
      permission: 'hr.integration.manage',
    } as const;

    const manifest = {
      title: 'HR',
      version: '8',
      permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
      integrations: [facebook],
      actions: [
        { type: 'hr.facebook.reply', label: 'Reply on Facebook', integration: 'facebook' },
        { type: 'hr.leave.create', label: 'Request leave' },
      ],
    };

    const register = async (body: typeof manifest) =>
      t.client(await t.pluginToken()).plugins.registerManifest(body);

    await register(manifest);

    const actions = (await t.owner().automations.catalog({})).actions.filter(
      (action) => action.source === 'hr',
    );

    expect(
      actions.map(({ type, integration, integrationName }) => ({
        type,
        integration,
        integrationName,
      })),
    ).toEqual([
      { type: 'hr.facebook.reply', integration: 'hr.facebook', integrationName: 'Facebook' },
      { type: 'hr.leave.create', integration: null, integrationName: null },
    ]);
    expect(
      (await t.owner().integrations.list()).data.find(
        (integration) => integration.plugin === 'hr' && integration.key === 'facebook',
      )?.actions,
    ).toEqual([{ type: 'hr.facebook.reply', label: 'Reply on Facebook', description: null }]);

    await expect(
      register({
        ...manifest,
        version: '9',
        actions: [{ type: 'hr.chat.reply', label: 'Reply', integration: 'instagram' }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_INTEGRATION' });
  });
});
