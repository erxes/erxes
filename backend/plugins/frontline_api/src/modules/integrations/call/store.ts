import { IModels } from '~/connectionResolvers';
import {
  cfRecordUrl,
  createOrUpdateErxesConversation,
  getPureDate,
  sendToGrandStream,
  toCamelCase,
} from './utils';
import { IOrignalCallCdr } from '~/modules/integrations/call/@types/cdrs';
import { ICallCustomer } from '~/modules/integrations/call/@types/customers';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import { graphqlPubsub } from 'erxes-api-shared/utils';

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
    status: 'completed',
  });
  if (!customer) {
    try {
      customer = await models.CallCustomers.create({
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
      const data = {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: inboxIntegrationId,
          primaryPhone: primaryPhone,
          isUser: true,
          phones: [primaryPhone],
        }),
      };
      const apiCustomerResponse = await receiveInboxMessage(subdomain, data);
      if (apiCustomerResponse.status === 'success') {
        customer.erxesApiId = apiCustomerResponse.data._id;
        customer.status = 'completed';
        await customer.save();
      } else {
        throw new Error(
          `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`,
        );
      }
    } catch (e: any) {
      await models.CallCustomers.deleteOne({ _id: customer._id });
      // Re-throw with added context, preserving original stack
      throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
    }
  }
  return customer;
};

export const getOrCreateCdr = async (
  models: IModels,
  subdomain: string,
  cdrParams: IOrignalCallCdr,
  inboxId: string,
  customer: ICallCustomer,
  operatorPhone: string,
) => {
  const { AcctId: acctId } = cdrParams;

  if (!acctId) {
    throw new Error('AcctId is required');
  }

  const cdr = await models.CallCdrs.findOne({
    acctId,
  });

  if (cdr) {
    if (
      cdr.recordUrl &&
      !['null', '', 'invalid file type'].includes(cdr.recordUrl)
    ) {
      await saveRecordUrl(cdr, models, inboxId, subdomain);
      return 'successfully saved record url';
    }
    return cdr;
  }

  const camelCase = toCamelCase(cdrParams);
  const { AcctId, ...filteredCamelCase } = camelCase as any;

  const createdCdr = new models.CallCdrs({
    acctId,
    ...filteredCamelCase,
    inboxIntegrationId: inboxId,
    createdAt: new Date(),
  });
  await createdCdr.save();

  if (cdrParams?.lastapp !== 'ForkCDR') {
    try {
      const { userfield, dst, src, action_type } = cdrParams;

      const primaryPhone =
        userfield === 'Outbound' && !action_type.includes('FOLLOWME')
          ? dst
          : src;

      // Find existing conversation for this phone number
      const existingConversation = await models.CallCdrs.findOne({
        $or: [{ src: primaryPhone }, { dst: primaryPhone }],
        conversationId: { $exists: true, $ne: '' },
        inboxIntegrationId: inboxId,
      }).sort({ createdAt: -1 });

      let conversationId = '';

      if (existingConversation && existingConversation.conversationId) {
        // Use existing conversation
        conversationId = existingConversation.conversationId;
      }

      // Create new conversation only if none exists for this phone number
      const conversationPayload = {
        customerId: customer?.erxesApiId,
        integrationId: inboxId,
        content: cdrParams.disposition || '',
        conversationId,
        updatedAt: new Date(),
        owner: operatorPhone || '',
      };

      const payload = JSON.stringify(conversationPayload);

      const apiConversationResponse = await createOrUpdateErxesConversation(
        subdomain,
        payload,
      );

      if (apiConversationResponse.status === 'success') {
        createdCdr.conversationId = apiConversationResponse.data._id;
        await createdCdr.save();
      } else {
        throw new Error(
          `Conversation creation failed: ${JSON.stringify(
            apiConversationResponse,
          )}`,
        );
      }

      await graphqlPubsub.publish(
        `conversationMessageInserted:${createdCdr.conversationId}`,
        {
          conversationMessageInserted: {
            ...createdCdr?.toObject(),
            conversationId: createdCdr.conversationId,
          },
        },
      );

      await saveRecordUrl(createdCdr, models, inboxId, subdomain);
    } catch (error) {
      await models.CallCdrs.deleteOne({ _id: createdCdr._id });
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  return createdCdr;
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
        retryCount: 1,
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
