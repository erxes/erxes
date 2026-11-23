import {
  findIntegration,
  sanitizeOperators,
  sendToGrandStream,
} from '../../utils';

import { IContext } from '~/connectionResolvers';
import { ExpectedError } from 'erxes-api-shared/utils';
import { syncCdrRecordFile, getOrCreateCustomer } from '../../store';

export interface ISession {
  sessionCode: string;
}

interface IBridgedChannel {
  callerid1?: string;
  callerid2?: string;
  channel1?: string;
  channel2?: string;
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
      integration: integration
        ? { _id: integration._id, name: integration.name }
        : null,
    };
  },

  async callsUpdateConfigs(
    _root,
    { configsMap },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

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
    const extensionNumber = integration.operators.find(
      (operator) => operator.userId === user?._id,
    )?.gsUsername;

    if (!extensionNumber) {
      throw new ExpectedError(
        'You have no call extension on this integration. Ask an admin to add you as an operator.',
      );
    }

    const queueData = await sendToGrandStream(
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
    );

    if (queueData?.status === 0) {
      const need_apply = queueData.response?.need_apply;
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
    const channels: IBridgedChannel[] =
      listBridgedChannelsResponse?.status === 0
        ? listBridgedChannelsResponse.response?.channel || []
        : [];
    const matched = channels.find(
      (ch) => ch.callerid1 === extension || ch.callerid2 === extension,
    );
    const channel =
      matched?.callerid1 === extension ? matched?.channel1 : matched?.channel2;

    if (!channel) {
      throw new ExpectedError(
        `No active call found on extension ${extension} to transfer`,
      );
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

    if (callTransferResponse?.status === 0) {
      return 'success';
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

      if (!cdr) throw new Error('Cannot sync record file');
      await syncCdrRecordFile(cdr, models, inboxId, subdomain);
      return 'successfully updated';
    }
    throw new Error('Cannot sync record file');
  },
};

export default callsMutations;
