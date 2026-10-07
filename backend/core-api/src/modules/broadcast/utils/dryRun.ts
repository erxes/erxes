import {
  findUnresolvedPlaceholders,
  TEmailFieldOutcome,
} from 'erxes-api-shared/core-modules';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { renderBroadcastEmail } from './renderEmail';
import { customerTargetFilter } from './targeting';

const DEFAULT_SAMPLE_SIZE = 20;
const MAX_SAMPLE_SIZE = 100;

export type TBroadcastDryRun = {
  sampled: number;
  fields: { id: string; filled: number; missing: number }[];
  unresolved: string[];
  sampleTo?: string;
  sampleHtml?: string;
};

/**
 * Sends the campaign to nobody, to a handful of the people it would really go
 * to, and reports what came out.
 *
 * It renders through the same function the worker does, because a rehearsal
 * that takes a different path only proves that the rehearsal works. What it
 * answers is the question a finished campaign cannot: was a field empty for
 * these particular people, or is it empty for everyone.
 */
export const dryRunBroadcastEmail = async ({
  models,
  subdomain,
  engageMessageId,
  sampleSize = DEFAULT_SAMPLE_SIZE,
}: {
  models: IModels;
  subdomain: string;
  engageMessageId: string;
  sampleSize?: number;
}): Promise<TBroadcastDryRun> => {
  const campaign = await models.EngageMessages.findOne({
    _id: engageMessageId,
  }).lean();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const customers = await models.Customers.find(
    customerTargetFilter(campaign.targetType || '', campaign.targetIds || []),
  )
    .limit(Math.min(Math.max(sampleSize, 1), MAX_SAMPLE_SIZE))
    .lean<ICustomerDocument[]>();

  const postalAddress = formatPostalAddress(await getPostalAddress(models));

  const counts = new Map<string, { filled: number; missing: number }>();
  const unresolved = new Set<string>();

  let sampleTo: string | undefined;
  let sampleHtml: string | undefined;

  for (const customer of customers) {
    const onFields = (fields: TEmailFieldOutcome[]) => {
      for (const { id, filled } of fields) {
        const entry = counts.get(id) || { filled: 0, missing: 0 };

        entry[filled ? 'filled' : 'missing']++;
        counts.set(id, entry);
      }
    };

    const { htmlContent } = await renderBroadcastEmail({
      models,
      subdomain,
      email: campaign.email || {},
      customer,
      postalAddress,
      onFields,
    });

    for (const placeholder of [
      ...findUnresolvedPlaceholders(htmlContent),
      ...findUnresolvedPlaceholders(campaign.email?.subject),
    ]) {
      unresolved.add(placeholder);
    }

    if (!sampleHtml) {
      sampleTo = customer.primaryEmail || '';
      sampleHtml = htmlContent;
    }
  }

  return {
    sampled: customers.length,
    fields: [...counts].map(([id, entry]) => ({ id, ...entry })),
    unresolved: [...unresolved],
    sampleTo,
    sampleHtml,
  };
};
