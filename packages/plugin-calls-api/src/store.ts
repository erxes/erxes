import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { IOrignalCallCdr } from './models/definitions/cdr';
import { ICustomer } from './models/definitions/customers';
import {
  cfRecordUrl,
  getPureDate,
  sendToGrandStream,
  toCamelCase,
} from './utils';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: any,
) => {
  const { inboxIntegrationId, primaryPhone } = callAccount;
  let customer = await models.Customers.findOne({
    primaryPhone,
    status: 'completed',
  });
  if (!customer) {
    try {
      customer = await models.Customers.create({
        inboxIntegrationId,
        erxesApiId: null,
        primaryPhone: primaryPhone,
        status: 'pending',
      });
    } catch (e) {
      if (e.message.includes('duplicate')) {
        return await getOrCreateCustomer(models, subdomain, callAccount);
      } else {
        throw new Error(e);
      }
    }

    try {
      const apiCustomerResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: inboxIntegrationId,
            primaryPhone: primaryPhone,
            isUser: true,
            phone: [primaryPhone],
          }),
        },
        isRPC: true,
      });
      customer.erxesApiId = apiCustomerResponse._id;
      customer.status = 'completed';
      await customer.save();
    } catch (e) {
      await models.Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }
  return customer;
};

export const getOrCreateCdr = async (
  models: IModels,
  subdomain: string,
  cdrParams: IOrignalCallCdr,
  inboxId: string,
  customer: ICustomer,
  operatorPhone: string,
) => {
  const { AcctId: acctId } = cdrParams;
  console.log('get cdr///', acctId, customer);

  if (!acctId) {
    throw new Error('AcctId is required');
  }

  let cdr = await models.Cdrs.findOne({
    acctId,
  });

  if (cdr) {
    if (
      cdr.recordUrl &&
      !['null', '', 'invalid file type'].includes(cdr.recordUrl)
    ) {
      await saveRecordUrl(cdr, models, inboxId, subdomain);
      console.log('updated record url:', cdr.acctId);
      return 'successfully saved record url';
    }
    return cdr;
  }

  const camelCase = toCamelCase(cdrParams);
  const { AcctId, ...filteredCamelCase } = camelCase as any;

  const createdCdr = new models.Cdrs({
    acctId,
    ...filteredCamelCase,
    inboxIntegrationId: inboxId,
    createdAt: new Date(),
  });
  await createdCdr.save();
  if (cdrParams?.lastapp !== 'ForkCDR') {
    try {
      const oldCdr = await models.Cdrs.findOne({
        uniqueid: cdrParams.uniqueid,
        conversationId: { $exists: true, $ne: '' },
      });

      const conversationPayload = {
        customerId: customer?.erxesApiId,
        integrationId: inboxId,
        content: cdrParams.disposition || '',
        conversationId: oldCdr?.conversationId || '',
        updatedAt: new Date(),
        owner: operatorPhone || '',
      };

      if (oldCdr) {
        await models.Cdrs.updateOne(
          { _id: oldCdr._id, conversationId: { $exists: true, $ne: '' } },
          { $set: { conversationId: '' } },
        );
      }

      const apiConversationResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'create-or-update-conversation',
          payload: JSON.stringify(conversationPayload),
        },
        isRPC: true,
      });

      createdCdr.conversationId = apiConversationResponse._id;
      await createdCdr.save();

      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...createdCdr.toObject(),
          conversationId: createdCdr.conversationId,
        },
      });
      await saveRecordUrl(createdCdr, models, inboxId, subdomain);
    } catch (error) {
      await models.Cdrs.deleteOne({ _id: createdCdr._id });

      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  return createdCdr;
};

export async function saveRecordUrl(createdCdr, models, inboxId, subdomain) {
  let recordUrl =
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
        retryCount: 1,
      },
      '',
      models,
      subdomain,
    );

    if (recordPath?.includes('wav')) {
      await models.Cdrs.updateOne(
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
      retryCount: 1,
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
  let results = [] as any;
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
