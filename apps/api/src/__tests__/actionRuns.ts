import { beforeAll } from 'vite-plus/test';
import { type DefinitionInput, type StepInput, useAutomations } from './automations.fixture';
import { makeDue, settle } from './settle';

/** Runs `steps` once an invoice for `referenceId` is paid. */
export const onPaid = (referenceId: string, steps: StepInput[]): DefinitionInput => ({
  trigger: {
    kind: 'event',
    event: 'core.payment.paid',
    conditions: {
      match: 'all',
      rules: [{ path: 'event.payload.referenceId', op: 'eq', value: referenceId }],
    },
  },
  steps,
});

/**
 * Automations (`useAutomations`) with Acme's Test gateway connected, and helpers to pay an
 * invoice through it and to settle a run whose step keeps failing.
 */
export const useActionRuns = () => {
  const t = useAutomations();

  beforeAll(async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Till', keys: {} });
  });

  /** Settles the automation's first run through every retry its failing step gets. */
  const retriedOut = async (automationId: string) => {
    await settle();

    for (let retry = 0; retry < 5; retry += 1) {
      if ((await t.runsOf(automationId))[0]?.status !== 'running') return;

      await makeDue();
      await settle();
    }
  };

  /** A ₮1,000 invoice for an order, paid through the Test gateway. */
  const paidInvoice = async (referenceId: string) => {
    const invoice = await t.owner().payments.createInvoice({
      amount: 100_000,
      currency: 'MNT',
      description: 'Order',
      referenceType: 'order',
      referenceId,
    });

    await t.owner().payments.payTestInvoice({ id: invoice.id });

    return invoice;
  };

  return { ...t, retriedOut, paidInvoice };
};
