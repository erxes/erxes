import { IModels } from '~/connectionResolvers';
import { cfRecordUrl, getPureDate, sendToGrandStream } from './utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: any,
) => {
  const { inboxIntegrationId, primaryPhone } = callAccount;
  if (typeof primaryPhone !== 'string') {
    throw new Error('Invalid primaryPhone: must be a string');
  }

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
    } catch (e: any) {
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
    } catch (e: any) {
      if (createdNow) {
        await models.CallCustomers.deleteOne({ _id: customer._id });
      }
      throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
    }
  }
  if (customer?.erxesApiId) {
    const coreCustomer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        query: { _id: customer.erxesApiId },
      },
    });
    if (coreCustomer?._id) {
      await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateCustomer',
        input: {
          _id: coreCustomer._id,
          doc: {
            primaryPhone,
          },
        },
      });
    }
    if (!coreCustomer) {
      const newCustomer = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation', // this is a mutation, not a query
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

export async function saveRecordUrl(
  createdCdr,
  models: IModels,
  inboxId: string,
  subdomain: string,
) {
  const recordUrl =
    createdCdr.disposition === 'ANSWERED' &&
    (createdCdr.recordfiles ||
      (await fetchRecordUrl(models, inboxId, createdCdr)));

  if (recordUrl) {
    let fileDir =
      ['QUEUE', 'TRANSFER'].some((substring) =>
        createdCdr.actionType?.includes(substring),
      ) && createdCdr.userfield === 'Inbound'
        ? 'queue'
        : 'monitor';

    if (createdCdr?.action_type?.includes('FOLLOWME')) {
      if (createdCdr?.userfield === 'Inbound') {
        fileDir = 'monitor';
      }
      if (createdCdr?.userfield === 'Outbound') {
        fileDir = 'queue';
      }
    }
    const recordPath = await cfRecordUrl(
      {
        fileDir,
        recordfiles: recordUrl,
        inboxIntegrationId: inboxId,
        retryCount: 3,
      },
      '',
      models,
      subdomain,
    );

    if (recordPath?.includes('wav')) {
      await models.CallCdrs.updateOne(
        { _id: createdCdr?._id?.toString() },
        { $set: { recordUrl: recordPath } },
        { upsert: true },
      );
    }
  }
}

const fetchRecordUrl = async (models, inboxIntegrationId, params) => {
  const { src, dst, start, end } = params;
  const startTime =
    typeof start === 'string' && start.includes(' ')
      ? start.replace(' ', 'T')
      : getPureDate(start, 0);
  const endTime =
    typeof end === 'string' && end.includes(' ')
      ? end.replace(' ', 'T')
      : getPureDate(end, 0);

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
