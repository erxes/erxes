import { IBroadcastRecipientDocument } from '@/broadcast/db/models/BroadcastRecipients';
import { IBroadcastRunDocument } from '@/broadcast/db/models/BroadcastRuns';
import dayjs from 'dayjs';
import { deliverEmail, normalizeEmail } from 'erxes-api-shared/utils';
import * as _ from 'lodash';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { generateModels, IModels } from '~/connectionResolvers';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';
import { replaceContent } from '~/modules/documents/utils';
import { unsubscribeUrl } from '~/utils/email/links';
import {
  createDeliveryLogPort,
  createSuppressionPort,
} from '~/utils/email/ports';
import { claim } from '~/utils/email/ramp';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { prepareEmailParams, readFileUrl } from '../utils';
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

const renderEmail = async (
  subdomain: string,
  run: IBroadcastRunDocument,
  customer: ICustomerDocument,
  postalAddress: string,
) => {
  const replacedContent = await replaceContent({
    replacer: customer,
    content: run.email?.content,
    replacement: (replacer, path) => {
      const value = _.get(replacer, path);

      if (typeof value === 'number') {
        return value.toString();
      }

      if (value instanceof Date) {
        return dayjs(value).format('YYYY-MM-DD');
      }

      return value?.toString() || '-';
    },
  });

  const link = unsubscribeUrl(subdomain, { cid: customer._id });

  return {
    link,
    htmlContent: blocksToHtml(replacedContent, {
      wrapper: { email: true, unsubscribeUrl: link, postalAddress },
      resolveImageUrl: (url) => readFileUrl(url, subdomain),
    }),
  };
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

  for (let index = 0; index < sendable.length; index++) {
    const { recipient, customer } = sendable[index];

    if (!allowed.has(String(customer._id))) {
      continue;
    }

    try {
      const { link, htmlContent } = await renderEmail(
        subdomain,
        run,
        customer,
        postalAddress,
      );

      const outcome = await deliverEmail({
        cacheKey,
        config: providerConfig,
        message: toOutboundEmail(
          prepareEmailParams(
            subdomain,
            customer as any,
            {
              _id: run.engageMessageId,
              email: { ...(run.email || {}), content: htmlContent },
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

      return {
        exhausted: true,
        resumeIn: wait,
        reason: `Sending paused for ${describeCoolDown(
          wait,
        )}: the email provider asked us to slow down (${error.message}).`,
      };
    }
  }

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
