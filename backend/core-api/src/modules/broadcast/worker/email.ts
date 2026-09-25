import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { IBroadcastRunDocument } from '@/broadcast/db/models/BroadcastRuns';
import { deliverEmail, normalizeEmail } from 'erxes-api-shared/utils';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { generateModels, IModels } from '~/connectionResolvers';
import {
  describeUnresolvedPlaceholders,
  findUnresolvedPlaceholders,
  TEmailFieldOutcome,
} from 'erxes-api-shared/core-modules';
import {
  createDeliveryLogPort,
  createSuppressionPort,
} from '~/utils/email/ports';
import { claim } from '~/utils/email/ramp';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { prepareEmailParams } from '../utils';
import { renderBroadcastEmail } from '../utils/renderEmail';
import {
  getBroadcastAlignedFrom,
  getBroadcastCacheKey,
  getBroadcastEmailConfig,
  toOutboundEmail,
} from '../utils/outboundEmail';
import {
  clearStrikes,
  coolDownRemaining,
  describeCoolDown,
  isBackoff,
  startCoolDown,
} from '../utils/backoff';
import { drainRun, TDrainDeliver } from './drain';

/**
 * How much of a claimed block may be sent today.
 *
 * A proven address costs nothing against the allowance; an unproven one is
 * rationed by the ramp, which is what protects the sending reputation. This is
 * a different question from the manifest's own claim — that one only decides
 * who holds a row — and both have to be asked.
 */
const grantSendingAllowance = async (
  models: IModels,
  customers: ICustomerDocument[],
) => {
  const proven = await models.EmailAddresses.listProven(
    customers.map((customer) => customer.primaryEmail || ''),
  );

  const allowed = new Set<string>();
  const unproven: ICustomerDocument[] = [];

  for (const customer of customers) {
    if (proven.has(normalizeEmail(customer.primaryEmail || ''))) {
      allowed.add(String(customer._id));
    } else {
      unproven.push(customer);
    }
  }

  const granted = await claim(models, unproven.length);

  for (const customer of unproven.slice(0, granted)) {
    allowed.add(String(customer._id));
  }

  return { allowed, exhausted: granted < unproven.length };
};

/**
 * What the run froze, as a plain object.
 *
 * `run` is a mongoose document, so `run.email` is a sub-document: spreading
 * one copies its internals rather than its fields, and everything but the
 * body — subject, sender, reply-to — would quietly vanish on the way to the
 * provider.
 */
const frozenEmail = (run: IBroadcastRunDocument): Record<string, any> => {
  const email = run.email as
    | (Record<string, any> & { toObject?: () => Record<string, any> })
    | undefined;

  return email?.toObject?.() ?? email ?? {};
};

type TFieldCounts = Map<string, { filled: number; missing: number }>;

const countFields = (counts: TFieldCounts, fields: TEmailFieldOutcome[]) => {
  for (const { id, filled } of fields) {
    const entry = counts.get(id) || { filled: 0, missing: 0 };

    entry[filled ? 'filled' : 'missing']++;
    counts.set(id, entry);
  }
};

/**
 * How often each field the email asks for was answered, kept on the run.
 *
 * This is what tells a campaign that went out looking wrong apart: a field
 * missing for a hundred of ten thousand people is those people's data, and
 * one missing for all ten thousand was never connected to anything.
 */
const recordFieldStats = async (
  models: IModels,
  run: IBroadcastRunDocument,
  counts: TFieldCounts,
) => {
  if (!counts.size) {
    return;
  }

  await models.BroadcastRuns.bulkWrite(
    [...counts].flatMap(([id, { filled, missing }]) => [
      {
        updateOne: {
          filter: { _id: run._id, 'fieldStats.id': { $ne: id } },
          update: { $push: { fieldStats: { id, filled: 0, missing: 0 } } },
        },
      },
      {
        updateOne: {
          filter: { _id: run._id, 'fieldStats.id': id },
          update: {
            $inc: {
              'fieldStats.$.filled': filled,
              'fieldStats.$.missing': missing,
            },
          },
        },
      },
    ]),
  );
};

/**
 * The first body a run produces, kept so the campaign can be asked afterwards
 * what it actually sent. Written once — later recipients leave it alone.
 */
const keepSample = async (
  models: IModels,
  run: IBroadcastRunDocument,
  to: string,
  html: string,
) => {
  await models.BroadcastRuns.updateOne(
    { _id: run._id, sample: { $exists: false } },
    { $set: { sample: { to, html, renderedAt: new Date() } } },
  );
};

const deliverEmails: TDrainDeliver = async ({
  models,
  subdomain,
  run,
  recipients,
}) => {
  // Asked before anything is decided about this block, so a block met during
  // a pause goes back whole rather than half-marked.
  const waiting = await coolDownRemaining(subdomain);

  if (waiting) {
    await models.BroadcastRecipients.release(recipients.map(({ _id }) => _id));

    return {
      exhausted: true,
      resumeIn: waiting,
      reason: `Sending paused: waiting ${describeCoolDown(
        waiting,
      )} for the email provider.`,
    };
  }

  const customers = await models.Customers.find({
    _id: { $in: recipients.map(({ customerId }) => customerId) },
  }).lean();

  const byId = new Map(customers.map((customer) => [customer._id, customer]));

  const sendable: {
    recipient: IBroadcastRecipientDocument;
    customer: ICustomerDocument;
  }[] = [];

  for (const recipient of recipients) {
    const customer = byId.get(recipient.customerId);

    if (!customer) {
      await models.BroadcastRecipients.finish(
        recipient._id,
        'missing',
        'customer no longer exists',
      );
      continue;
    }

    // Frozen at enrolment is who was targeted, never whether they may still be
    // reached: someone who unsubscribed while the run was paused is decided
    // here.
    if (customer.isSubscribed && customer.isSubscribed !== 'Yes') {
      await models.BroadcastRecipients.finish(
        recipient._id,
        'skipped',
        'unsubscribed',
      );
      continue;
    }

    if (!customer.primaryEmail) {
      await models.BroadcastRecipients.finish(
        recipient._id,
        'skipped',
        'no email address',
      );
      continue;
    }

    sendable.push({ recipient, customer });
  }

  if (!sendable.length) {
    return {};
  }

  const { allowed, exhausted } = await grantSendingAllowance(
    models,
    sendable.map(({ customer }) => customer),
  );

  const deferred = sendable
    .filter(({ customer }) => !allowed.has(String(customer._id)))
    .map(({ recipient }) => recipient._id);

  await models.BroadcastRecipients.release(deferred);

  const providerConfig = await getBroadcastEmailConfig(models);
  const cacheKey = getBroadcastCacheKey(models);
  const log = createDeliveryLogPort(models);
  const suppression = createSuppressionPort(models);
  const postalAddress = formatPostalAddress(await getPostalAddress(models));
  const alignedFrom = await getBroadcastAlignedFrom(models);

  let sent = 0;
  const fieldCounts: TFieldCounts = new Map();
  const email = frozenEmail(run);

  for (let index = 0; index < sendable.length; index++) {
    const { recipient, customer } = sendable[index];

    if (!allowed.has(String(customer._id))) {
      continue;
    }

    try {
      const { link, htmlContent } = await renderBroadcastEmail({
        models,
        subdomain,
        email,
        customer,
        postalAddress,
        onFields: (fields) => countFields(fieldCounts, fields),
      });

      // No provider accepts an email without a subject, and the one that
      // refuses it reports it as its own error rather than ours.
      if (!String(email.subject || '').trim()) {
        await models.BroadcastRecipients.finish(
          recipient._id,
          'failed',
          'email subject is empty',
        );

        continue;
      }

      // The subject is checked with the body: a marker in it reaches the
      // inbox list, where it is the first thing anyone sees.
      const unresolved = [
        ...findUnresolvedPlaceholders(htmlContent),
        ...findUnresolvedPlaceholders(String(email.subject || '')),
      ];

      // Nobody is sent an email with a marker still in it. A record with
      // nothing for a field renders its default instead, so this can only be
      // something that was never wired up.
      if (unresolved.length) {
        await models.BroadcastRecipients.finish(
          recipient._id,
          'failed',
          describeUnresolvedPlaceholders(unresolved),
        );

        continue;
      }

      await keepSample(models, run, customer.primaryEmail || '', htmlContent);

      const outcome = await deliverEmail({
        cacheKey,
        config: providerConfig,
        message: toOutboundEmail(
          prepareEmailParams(
            subdomain,
            customer as any,
            {
              _id: run.engageMessageId,
              email: { ...email, content: htmlContent },
            } as any,
            run.fromEmail || '',
            run.configSet,
          ),
          { unsubscribeUrl: link, alignedFrom },
        ),
        log,
        suppression,
        meta: {
          source: 'broadcast',
          sourceId: run.engageMessageId,
          subdomain,
        },
      });

      if (outcome.skipped) {
        await models.BroadcastRecipients.finish(
          recipient._id,
          'skipped',
          `suppressed: ${outcome.suppressed?.join(', ')}`,
        );
        continue;
      }

      await models.Stats.updateOne(
        { engageMessageId: run.engageMessageId },
        { $inc: { total: 1 } },
      );

      await models.BroadcastRecipients.finish(recipient._id, 'sent');
      sent++;
    } catch (error: any) {
      if (!isBackoff(error)) {
        await models.BroadcastRecipients.finish(
          recipient._id,
          'failed',
          error.message,
        );

        continue;
      }

      // The provider turned this attempt down. This person and everyone left
      // in the block go back in the manifest untouched: they were never the
      // problem, and marking them unreachable would lose them for good.
      const wait = await startCoolDown(subdomain);

      await models.BroadcastRecipients.release(
        sendable.slice(index).map(({ recipient: held }) => held._id),
      );

      await recordFieldStats(models, run, fieldCounts);

      return {
        exhausted: true,
        resumeIn: wait,
        reason: `Sending paused for ${describeCoolDown(
          wait,
        )}: the email provider asked us to slow down (${error.message}).`,
      };
    }
  }

  await recordFieldStats(models, run, fieldCounts);

  // A block that got through ends the spell, so the next refusal starts from
  // a minute again rather than from where the last one left off.
  if (sent) {
    await clearStrikes(subdomain);
  }

  return { exhausted };
};

export const handleEmailProcessor = async (payload: unknown) => {
  const { subdomain, runId } = (payload || {}) as {
    subdomain: string;
    runId: string;
  };

  const models = await generateModels(subdomain);
  const run = await models.BroadcastRuns.findOne({ _id: runId }).lean();

  if (run) {
    await models.Stats.findOneAndUpdate(
      { engageMessageId: run.engageMessageId },
      { engageMessageId: run.engageMessageId },
      { upsert: true },
    );
  }

  return drainRun(payload, deliverEmails);
};
