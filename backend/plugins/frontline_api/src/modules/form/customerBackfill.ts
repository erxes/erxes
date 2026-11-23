import { performance } from 'node:perf_hooks';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';

const CUSTOMER_TYPE_PREFIX = 'core:customer:';
const READ_CHUNK = 200;
const WRITE_CONCURRENCY = 10;

type CustomerProfile = {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  description?: string;
  primaryEmail?: string;
  emails?: string[];
  primaryPhone?: string;
  phones?: string[];
  birthDate?: string | Date;
};

type CustomerProfileUpdate = Partial<Omit<CustomerProfile, '_id'>>;

export interface CustomerBackfillPlan {
  fillCount: number;
  keptCount: number;
  updates: { customerId: string; doc: CustomerProfileUpdate }[];
}

export const isCustomerFieldType = (type?: string): boolean =>
  !!type?.startsWith(CUSTOMER_TYPE_PREFIX);

// Mirrors what widgetsSaveLead writes for an existing customer, but returns
// undefined when the profile already holds a value: a saved form answer must
// never replace what someone entered on the profile.
const buildProfileUpdate = (
  customer: CustomerProfile,
  targetType: string,
  value: unknown,
  saveAsCustomer: boolean,
): CustomerProfileUpdate | undefined => {
  const key = targetType.slice(CUSTOMER_TYPE_PREFIX.length);
  if (key === 'email') {
    if (customer.primaryEmail || customer.emails?.length) return undefined;
    // Kept as typed, like widgetsSaveLead: core matches emails exactly.
    const email = String(value);
    return {
      emails: [email],
      ...(saveAsCustomer ? { primaryEmail: email } : {}),
    };
  }
  if (key === 'phone') {
    if (customer.primaryPhone || customer.phones?.length) return undefined;
    const phone = String(value);
    return {
      phones: [phone],
      ...(saveAsCustomer ? { primaryPhone: phone } : {}),
    };
  }
  if (key === 'birthDate') {
    if (customer.birthDate) return undefined;
    const birthDate = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(birthDate.getTime()) ? undefined : { birthDate };
  }
  if (
    key === 'firstName' ||
    key === 'middleName' ||
    key === 'lastName' ||
    key === 'description'
  ) {
    return customer[key] ? undefined : { [key]: String(value) };
  }
  return undefined;
};

// Each submitter's latest non-empty answer, compared with their current
// profile. Customers that no longer exist are neither filled nor kept.
export const planCustomerBackfill = async (
  subdomain: string,
  models: IModels,
  {
    formId,
    fieldId,
    targetType,
    saveAsCustomer = false,
    deadline,
  }: {
    formId: string;
    fieldId: string;
    targetType: string;
    saveAsCustomer?: boolean;
    deadline?: number;
  },
): Promise<CustomerBackfillPlan> => {
  const plan: CustomerBackfillPlan = {
    fillCount: 0,
    keptCount: 0,
    updates: [],
  };
  if (!isCustomerFieldType(targetType)) return plan;
  const aggregation = models.FormSubmissions.aggregate<{
    _id: string;
    value: unknown;
  }>([
    {
      $match: {
        formId,
        formFieldId: fieldId,
        customerId: { $nin: [null, ''] },
        // Blank optional dates used to be stored as 1970-01-01.
        value: {
          $nin:
            targetType === `${CUSTOMER_TYPE_PREFIX}birthDate`
              ? [null, '', new Date(0)]
              : [null, ''],
        },
      },
    },
    { $sort: { submittedAt: 1, _id: 1 } },
    { $group: { _id: '$customerId', value: { $last: '$value' } } },
  ])
    .read('primary')
    .allowDiskUse(true);
  if (deadline !== undefined) {
    aggregation.option({
      maxTimeMS: Math.max(1, Math.floor(deadline - performance.now())),
    });
  }
  const answers = await aggregation;
  for (let index = 0; index < answers.length; index += READ_CHUNK) {
    const chunk = answers.slice(index, index + READ_CHUNK);
    const customers: CustomerProfile[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'find',
      input: {
        query: {
          _id: { $in: chunk.map((answer) => answer._id) },
          status: { $ne: 'deleted' },
        },
      },
      defaultValue: [],
    });
    const values = new Map(chunk.map((answer) => [answer._id, answer.value]));
    for (const customer of customers) {
      const doc = buildProfileUpdate(
        customer,
        targetType,
        values.get(customer._id),
        saveAsCustomer,
      );
      if (doc) {
        plan.fillCount++;
        plan.updates.push({ customerId: customer._id, doc });
      } else {
        plan.keptCount++;
      }
    }
  }
  return plan;
};

// Runs after the conversion commits: customers live in core and cannot join
// the form transaction. Callers do not await it, so a form with many earlier
// submitters cannot hold up or fail the save; it therefore never rejects. A
// profile that cannot be updated (for example a duplicate primary email) is
// skipped.
export const backfillConvertedCustomerFields = async (
  subdomain: string,
  models: IModels,
  formId: string,
  conversions: { _id: string; type?: string }[],
): Promise<void> => {
  const targets = conversions.filter((field) =>
    isCustomerFieldType(field.type),
  );
  if (!targets.length) return;
  try {
    const form = await models.Forms.findOne({ _id: formId })
      .select('leadData.saveAsCustomer')
      .lean();
    for (const field of targets) {
      const { updates } = await planCustomerBackfill(subdomain, models, {
        formId,
        fieldId: field._id,
        targetType: field.type ?? '',
        saveAsCustomer: !!form?.leadData?.saveAsCustomer,
      });
      for (let index = 0; index < updates.length; index += WRITE_CONCURRENCY) {
        await Promise.allSettled(
          updates
            .slice(index, index + WRITE_CONCURRENCY)
            .map(({ customerId, doc }) =>
              sendTRPCMessage({
                subdomain,
                pluginName: 'core',
                method: 'mutation',
                module: 'customers',
                action: 'updateCustomer',
                input: { _id: customerId, doc },
              }),
            ),
        );
      }
    }
  } catch (error) {
    console.error('Failed to backfill converted customer fields:', error);
  }
};
