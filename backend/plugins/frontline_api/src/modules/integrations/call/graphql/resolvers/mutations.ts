import {
  findIntegration,
  sanitizeOperators,
  sendToGrandStream,
} from '../../utils';

import { IContext } from '~/connectionResolvers';
import { saveRecordUrl, getOrCreateCustomer } from '../../store';

export interface ISession {
  sessionCode: string;
}

const CONFIG_SETTABLE_FIELDS = [
  'phone',
  'wsServer',
  'srcTrunk',
  'dstTrunk',
  'queues',
  'queueNames',
];

const callsMutations = {
  async callsIntegrationUpdate(_root, { configs }, { models, user }: IContext) {
    if (!user?.isOwner) {
      throw new Error('Permission required');
    }

    const { inboxId, operators, ...rest } = configs;

    if (!inboxId) {
      throw new Error('inboxId is required');
    }

    const $set: Record<string, any> = {};
    for (const key of CONFIG_SETTABLE_FIELDS) {
      if (rest[key] !== undefined) {
        $set[key] = rest[key];
      }
    }

    if (operators !== undefined) {
      const current = await models.CallIntegrations.findOne({
        inboxId,
      }).lean();
      $set.operators = sanitizeOperators(operators, current?.operators);
    }

    const integration = await models.CallIntegrations.findOneAndUpdate(
      { inboxId },
      { $set },
      { new: true },
    );
    return integration;
  },
  async callAddCustomer(_root, args, { models, subdomain }: IContext) {
    const callIntegration = await findIntegration(subdomain, args);
    const customer = await getOrCreateCustomer(models, subdomain, args);
    const integration = await models.Integrations.findOne({
      _id: callIntegration?.inboxId,
    });

    const channel = integration
      ? await models.Channels.findOne({ _id: integration.channelId })
      : null;

    return {
      customer: customer?.erxesApiId
        ? {
            __typename: 'Customer',
            _id: customer.erxesApiId,
          }
        : null,
      channels: channel ? [channel] : [],
    };
  },

  async callsUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await models.CallConfigs.updateConfigs(configsMap);

    return { status: 'ok' };
  },

  async callsPauseAgent(
    _root,
    { status, integrationId },
    { models, user }: IContext,
  ) {
    const integration = await models.CallIntegrations.findOne({
      inboxId: integrationId,
    }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }
    const operator = integration.operators.find(
      (operator) => operator.userId === user?._id,
    );

    const extensionNumber = operator?.gsUsername || '1001';

    const queueData = (await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'pauseUnpauseQueueAgent',
            operatetype: status,
            interface: extensionNumber,
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData?.response) {
      const { need_apply } = queueData.response;
      const operator = await models.CallOperators.getOperator(user._id);
      if (operator) {
        await models.CallOperators.updateOperator(user._id, status);
      } else if (!operator) {
        await models.CallOperators.create({
          userId: user._id,
          status,
          extension: extensionNumber,
        });
      }
      return need_apply;
    }
    return 'failed';
  },

  async callTransfer(
    _root,
    { extensionNumber, integrationId, direction },
    { models, user }: IContext,
  ) {
    const listBridgedChannelsPayload = {
      path: 'api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        request: {
          action: 'listBridgedChannels',
        },
      },
      integrationId,
      retryCount: 3,
      isConvertToJson: true,
      isAddExtention: false,
      isGetExtension: true,
    };

    const {
      response: listBridgedChannelsResponse,
      extensionNumber: extension,
    } = await sendToGrandStream(models, listBridgedChannelsPayload, user);
    let channel = '';
    if (listBridgedChannelsResponse?.response) {
      const channels = listBridgedChannelsResponse.response.channel;
      if (channels) {
        const filteredChannels = channels.filter((ch) => {
          if (direction === 'incoming') {
            return ch.callerid2 === extension;
          } else {
            return ch.callerid1 === extension;
          }
        });
        if (filteredChannels.length > 0) {
          if (direction === 'incoming') {
            channel = filteredChannels[0].channel2 || '';
          } else {
            channel = filteredChannels[0].channel1 || '';
          }
        }
      }
    }

    const callTransferPayload = {
      path: 'api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        request: {
          action: 'callTransfer',
          extension: extensionNumber,
          channel,
        },
      },
      integrationId,
      retryCount: 3,
      isConvertToJson: true,
      isAddExtention: false,
    };

    const callTransferResponse = await sendToGrandStream(
      models,
      callTransferPayload,
      user,
    );

    if (callTransferResponse?.response?.need_apply) {
      return callTransferResponse?.response?.need_apply;
    }

    return 'failed';
  },
  async callSyncRecordFile(
    _root,
    { acctId, inboxId },
    { models, subdomain, user }: IContext,
  ) {
    let cdr = await models.CallCdrs.findOne({ acctId });
    if (cdr) {
      if (!cdr.recordfiles) {
        const payload = {
          path: 'api',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            request: {
              action: 'getRecordInfosByCall',
              id: cdr.acctId,
            },
          },
          integrationId: inboxId,
          retryCount: 3,
          isConvertToJson: true,
          isAddExtention: false,
        };

        const callRecordInfoResponse = await sendToGrandStream(
          models,
          payload,
          user,
        );

        if (callRecordInfoResponse?.response?.recordfiles) {
          await models.CallCdrs.updateOne(
            { acctId },
            { recordfiles: callRecordInfoResponse?.response?.recordfiles },
          );
          cdr = await models.CallCdrs.findOne({ acctId });
        }
      } else {
        await models.CallCdrs.updateOne(
          { acctId },
          { oldRecordUrl: cdr.recordUrl },
        );
      }

      await saveRecordUrl(cdr, models, inboxId, subdomain);
      return 'successfully updated';
    }
    throw new Error('Cannot sync record file');
  },
};

export default callsMutations;
