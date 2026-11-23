import { performance } from 'node:perf_hooks';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';

const CUSTOMER_TYPE_PREFIX = 'core:customer:';
const BIRTH_DATE_TYPE = `${CUSTOMER_TYPE_PREFIX}birthDate`;
const CHUNK_SIZE = 200;
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

type ProfileUpdateBuilder = (
  customer: CustomerProfile,
  value: unknown,
  saveAsCustomer: boolean,
) => CustomerProfileUpdate | undefined;

interface BackfillTarget {
  fieldId: string;
  targetType: string;
}

interface SubmitterAnswers {
  _id: string;
  answers: { fieldId: string; value: unknown }[];
}

interface BackfillChunk {
  fillCount: number;
  keptCount: number;
  updates: { customerId: string; doc: CustomerProfileUpdate }[];
}

export const isCustomerFieldType = (type?: string): boolean =>
  !!type?.startsWith(CUSTOMER_TYPE_PREFIX);

const fillText =
  (
    key: 'firstName' | 'middleName' | 'lastName' | 'description',
  ): ProfileUpdateBuilder =>
  (customer, value) =>
    customer[key] ? undefined : { [key]: String(value) };

const PROFILE_UPDATES: Record<string, ProfileUpdateBuilder> = {
  firstName: fillText('firstName'),
  middleName: fillText('middleName'),
  lastName: fillText('lastName'),
  description: fillText('description'),
  email: (customer, value, saveAsCustomer) => {
    if (customer.primaryEmail || customer.emails?.length) return undefined;
    const email = String(value);
    return saveAsCustomer
      ? { emails: [email], primaryEmail: email }
      : { emails: [email] };
  },
  phone: (customer, value, saveAsCustomer) => {
    if (customer.primaryPhone || customer.phones?.length) return undefined;
    const phone = String(value);
    return saveAsCustomer
      ? { phones: [phone], primaryPhone: phone }
      : { phones: [phone] };
  },
  birthDate: (customer, value) => {
    if (customer.birthDate) return undefined;
    const birthDate = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(birthDate.getTime()) ? undefined : { birthDate };
  },
};

const remainingMs = (deadline?: number): number | undefined => {
  if (deadline === undefined) return undefined;
  const remaining = Math.floor(deadline - performance.now());
  if (remaining <= 0) throw new Error('Customer backfill planning timed out');
  return remaining;
};

const answeredFilter = (targets: BackfillTarget[]) => {
  const dateFieldIds = targets
    .filter((target) => target.targetType === BIRTH_DATE_TYPE)
    .map((target) => target.fieldId);
  const otherFieldIds = targets
    .filter((target) => target.targetType !== BIRTH_DATE_TYPE)
    .map((target) => target.fieldId);
  return [
    { formFieldId: { $in: otherFieldIds }, value: { $nin: [null, ''] } },
    {
      formFieldId: { $in: dateFieldIds },
      value: { $nin: [null, '', new Date(0)] },
    },
  ];
};

const planChunk = async (
  subdomain: string,
  submitters: SubmitterAnswers[],
  targetTypes: Map<string, string>,
  saveAsCustomer: boolean,
  deadline?: number,
): Promise<BackfillChunk> => {
  const timeout = remainingMs(deadline);
  const customers: CustomerProfile[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'find',
    input: {
      query: {
        _id: { $in: submitters.map((submitter) => submitter._id) },
        status: { $ne: 'deleted' },
      },
    },
    options: timeout ? { signal: AbortSignal.timeout(timeout) } : undefined,
    defaultValue: [],
    throwOnError: true,
  });
  const profiles = new Map(
    customers.map((customer) => [customer._id, customer]),
  );
  const chunk: BackfillChunk = { fillCount: 0, keptCount: 0, updates: [] };
  for (const { _id, answers } of submitters) {
    const customer = profiles.get(_id);
    if (!customer) continue;
    let doc: CustomerProfileUpdate | undefined;
    for (const { fieldId, value } of answers) {
      const key = targetTypes.get(fieldId)?.slice(CUSTOMER_TYPE_PREFIX.length);
      const update = PROFILE_UPDATES[key ?? '']?.(
        customer,
        value,
        saveAsCustomer,
      );
      if (update) {
        chunk.fillCount++;
        doc = { ...doc, ...update };
      } else {
        chunk.keptCount++;
      }
    }
    if (doc) chunk.updates.push({ customerId: _id, doc });
  }
  return chunk;
};

async function* planCustomerBackfillChunks(
  subdomain: string,
  models: IModels,
  {
    formId,
    targets,
    saveAsCustomer = false,
    deadline,
  }: {
    formId: string;
    targets: BackfillTarget[];
    saveAsCustomer?: boolean;
    deadline?: number;
  },
): AsyncGenerator<BackfillChunk> {
  const customerTargets = targets.filter((target) =>
    isCustomerFieldType(target.targetType),
  );
  if (!customerTargets.length) return;
  const targetTypes = new Map(
    customerTargets.map((target) => [target.fieldId, target.targetType]),
  );
  const aggregation = models.FormSubmissions.aggregate<SubmitterAnswers>([
    {
      $match: {
        formId,
        customerId: { $nin: [null, ''] },
        $or: answeredFilter(customerTargets),
      },
    },
    { $sort: { submittedAt: 1, _id: 1 } },
    {
      $group: {
        _id: { customerId: '$customerId', fieldId: '$formFieldId' },
        value: { $last: '$value' },
      },
    },
    {
      $group: {
        _id: '$_id.customerId',
        answers: { $push: { fieldId: '$_id.fieldId', value: '$value' } },
      },
    },
  ])
    .read('primary')
    .allowDiskUse(true);
  const timeout = remainingMs(deadline);
  if (timeout) aggregation.option({ maxTimeMS: timeout });
  const cursor = aggregation.cursor({ batchSize: CHUNK_SIZE });
  try {
    let submitters: SubmitterAnswers[] = [];
    for await (const submitter of cursor) {
      submitters.push(submitter);
      if (submitters.length < CHUNK_SIZE) continue;
      yield await planChunk(
        subdomain,
        submitters,
        targetTypes,
        saveAsCustomer,
        deadline,
      );
      submitters = [];
    }
    if (submitters.length) {
      yield await planChunk(
        subdomain,
        submitters,
        targetTypes,
        saveAsCustomer,
        deadline,
      );
    }
  } finally {
    await cursor.close();
  }
}

export const countCustomerBackfill = async (
  subdomain: string,
  models: IModels,
  options: {
    formId: string;
    fieldId: string;
    targetType: string;
    deadline?: number;
  },
): Promise<{ fillCount: number; keptCount: number }> => {
  const counts = { fillCount: 0, keptCount: 0 };
  const chunks = planCustomerBackfillChunks(subdomain, models, {
    formId: options.formId,
    targets: [{ fieldId: options.fieldId, targetType: options.targetType }],
    deadline: options.deadline,
  });
  for await (const chunk of chunks) {
    counts.fillCount += chunk.fillCount;
    counts.keptCount += chunk.keptCount;
  }
  return counts;
};

const writeUpdates = async (
  subdomain: string,
  updates: BackfillChunk['updates'],
  concurrency: number,
): Promise<number> => {
  let failed = 0;
  for (let index = 0; index < updates.length; index += concurrency) {
    const results = await Promise.allSettled(
      updates.slice(index, index + concurrency).map(({ customerId, doc }) =>
        sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateCustomer',
          input: { _id: customerId, doc },
          throwOnError: true,
        }),
      ),
    );
    failed += results.filter((result) => result.status === 'rejected').length;
  }
  return failed;
};

const writeChunk = async (
  subdomain: string,
  updates: BackfillChunk['updates'],
): Promise<number> => {
  const claimed = new Set<string>();
  const distinct: BackfillChunk['updates'] = [];
  const repeated: BackfillChunk['updates'] = [];
  for (const update of updates) {
    const primaries = [
      update.doc.primaryEmail && `email:${update.doc.primaryEmail}`,
      update.doc.primaryPhone && `phone:${update.doc.primaryPhone}`,
    ].filter((primary): primary is string => !!primary);
    if (primaries.some((primary) => claimed.has(primary))) {
      repeated.push(update);
    } else {
      primaries.forEach((primary) => claimed.add(primary));
      distinct.push(update);
    }
  }
  return (
    (await writeUpdates(subdomain, distinct, WRITE_CONCURRENCY)) +
    (await writeUpdates(subdomain, repeated, 1))
  );
};

export const backfillConvertedCustomerFields = async (
  subdomain: string,
  models: IModels,
  formId: string,
  conversions: { _id: string; type?: string }[],
): Promise<void> => {
  const targets = conversions
    .filter((field) => isCustomerFieldType(field.type))
    .map((field) => ({ fieldId: field._id, targetType: field.type ?? '' }));
  if (!targets.length) return;
  try {
    const form = await models.Forms.findOne({ _id: formId })
      .select('leadData.saveAsCustomer')
      .lean();
    const chunks = planCustomerBackfillChunks(subdomain, models, {
      formId,
      targets,
      saveAsCustomer: !!form?.leadData?.saveAsCustomer,
    });
    let failed = 0;
    for await (const chunk of chunks) {
      failed += await writeChunk(subdomain, chunk.updates);
    }
    if (failed) {
      console.error(
        `Converted customer field backfill skipped ${failed} profiles on form ${formId}`,
      );
    }
  } catch (error) {
    console.error('Failed to backfill converted customer fields:', error);
  }
};
