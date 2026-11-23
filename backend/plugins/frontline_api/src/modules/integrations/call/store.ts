import { IModels } from '~/connectionResolvers';
import { cfRecordUrl, sendToGrandStream } from './utils';
import { formatCdrApiDate } from './services/cdrUtils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ICallCdrDocument } from '@/integrations/call/@types/cdrs';

interface ICallAccount {
  inboxIntegrationId?: string;
  primaryPhone?: string;
}

/*
 * Returns null for a call without a caller number (anonymous or withheld), so
 * those calls never share one customer.
 */
export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  { inboxIntegrationId, primaryPhone }: ICallAccount,
) => {
  if (!primaryPhone) return null;

  let customer = await models.CallCustomers.findOne({
    primaryPhone: { $eq: primaryPhone },
  });

  let createdNow = false;

  if (!customer) {
    try {
      customer = await models.CallCustomers.create({
        inboxIntegrationId,
        erxesApiId: null,
        primaryPhone,
        status: 'pending',
      });
      createdNow = true;
    } catch (e) {
      if (e.message?.includes('duplicate')) {
        customer = await models.CallCustomers.findOne({
          primaryPhone: { $eq: primaryPhone },
        });
        if (!customer) {
          throw new Error(
            `CallCustomer duplicate for ${primaryPhone} but re-fetch found nothing`,
          );
        }
      } else {
        throw e;
      }
    }
  }

  if (customer && !customer.erxesApiId) {
    try {
      const data = {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: inboxIntegrationId,
          primaryPhone,
          isUser: true,
          phones: [primaryPhone],
        }),
      };
      const apiCustomerResponse = await receiveInboxMessage(subdomain, data);

      if (
        apiCustomerResponse?.status === 'success' &&
        apiCustomerResponse.data?._id
      ) {
        customer.erxesApiId = apiCustomerResponse.data._id;
        customer.status = 'completed';
        await customer.save();
      } else {
        throw new Error(
          `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`,
        );
      }
    } catch (e) {
      if (createdNow) {
        await models.CallCustomers.deleteOne({ _id: customer._id });
      }
      throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
    }
  }
  if (customer?.erxesApiId) {
    // Throws when core is unreachable, so an outage never reads as a deleted
    // customer and spawns a duplicate.
    const coreCustomer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        query: { _id: customer.erxesApiId },
      },
      throwOnError: true,
    });
    if (!coreCustomer) {
      const newCustomer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'createCustomer',
        input: {
          doc: {
            primaryPhone,
            state: 'customer',
          },
        },
      });
      if (newCustomer?._id) {
        customer.erxesApiId = newCustomer._id;
        await customer.save();
      }
    }
  }
  return customer;
};

const recordFileDir = (cdr: ICallCdrDocument) => {
  if (cdr.actionType?.includes('FOLLOWME')) {
    return cdr.userfield === 'Outbound' ? 'queue' : 'monitor';
  }
  return ['QUEUE', 'TRANSFER'].some((type) => cdr.actionType?.includes(type)) &&
    cdr.userfield === 'Inbound'
    ? 'queue'
    : 'monitor';
};

/*
 * Uploads an answered CDR's recording again and stores the new URL on the CDR
 * and its session. Throws when there is nothing to upload or the upload does
 * not return a file, so the caller never reports a false success.
 */
export const syncCdrRecordFile = async (
  cdr: ICallCdrDocument,
  models: IModels,
  inboxId: string,
  subdomain: string,
) => {
  if ((cdr.disposition || '').toUpperCase() !== 'ANSWERED') {
    throw new Error('Only answered calls have a recording');
  }

  const recordfiles =
    cdr.recordfiles || (await fetchRecordUrl(models, inboxId, cdr));
  if (!recordfiles) {
    throw new Error('The call server has no recording for this call');
  }

  const recordUrl = await cfRecordUrl(
    {
      fileDir: recordFileDir(cdr),
      recordfiles,
      inboxIntegrationId: inboxId,
      retryCount: 3,
    },
    null,
    models,
    subdomain,
  );

  if (!recordUrl?.includes('wav')) {
    throw new Error(`Recording upload returned no file: ${recordUrl}`);
  }

  await models.CallCdrs.updateOne({ _id: cdr._id }, { $set: { recordUrl } });
  await models.CallSessions.updateMany(
    { cdrAcctId: cdr.acctId },
    { $set: { recordUrl } },
  );

  return recordUrl;
};

const fetchRecordUrl = async (
  models: IModels,
  inboxIntegrationId: string,
  params: ICallCdrDocument,
) => {
  const { src, dst, start, end } = params;
  const startTime = formatCdrApiDate(start);
  const endTime = formatCdrApiDate(end);

  const cdrData = await sendToGrandStream(
    models,
    {
      path: 'api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        request: {
          action: 'cdrapi',
          format: 'json',
          caller: src,
          callee: dst,
          numRecords: '10',
          startTime,
          endTime,
        },
      },
      integrationId: inboxIntegrationId,
      retryCount: 3,
      isConvertToJson: true,
      isGetExtension: false,
    },
    null,
  );

  const cdrRoot = cdrData.response?.cdr_root || cdrData.cdr_root;
  const recordFiles = getRecordFiles(cdrRoot);
  return recordFiles?.[0] || '';
};

function getRecordFiles(data) {
  const results = [] as any;
  data?.forEach((record: any) => {
    // Check in main_cdr
    if (
      record.main_cdr?.recordfiles &&
      record.main_cdr?.lastapp !== 'ForkCDR'
    ) {
      results.push(record.main_cdr.recordfiles);
    }

    // Check in sub_cdr_X
    Object.keys(record)?.forEach((key) => {
      if (
        key.startsWith('sub_cdr_') &&
        record[key]?.recordfiles &&
        record[key]?.lastapp !== 'ForkCDR'
      ) {
        results.push(record[key].recordfiles);
      }
    });

    // Check in b structure (no main_cdr/sub_cdr_X)
    if (record.recordfiles && record.lastapp !== 'ForkCDR') {
      results.push(record.recordfiles);
    }
  });

  return results;
}
