import {
  generateToken,
  getRecordUrl,
  sendToGrandStreamRequest,
} from '../../utils';
import { IContext, IModels } from '../../connectionResolver';

import acceptCall from '../../acceptCall';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { ICallHistory } from '../../models/definitions/callHistories';
import { sendInboxMessage } from '../../messageBroker';
import { updateConfigs } from '../../helpers';
import { getOrCreateCustomer } from '../../store';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

export interface ISession {
  sessionCode: string;
}
interface ICallHistoryEdit extends ICallHistory {
  _id: string;
}

const callsMutations = {
  async callsIntegrationUpdate(_root, { configs }, { models }: IContext) {
    const { inboxId, ...data } = configs;
    const token = await generateToken(inboxId);

    const integration = await models.Integrations.findOneAndUpdate(
      { inboxId },
      { $set: { ...data, token } },
    );
    return integration;
  },

  async callAddCustomer(_root, args, { models, subdomain }: IContext) {
    const integration = await models.Integrations.findOne({
      inboxId: args.inboxIntegrationId,
    }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }
    const customer = await getOrCreateCustomer(models, subdomain, args);

    const channels = await sendInboxMessage({
      subdomain,
      action: 'channels.find',
      data: {
        integrationIds: { $in: [integration.inboxId] },
      },
      isRPC: true,
    });
    return {
      customer: customer?.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId,
      },
      channels,
    };
  },

  async callUpdateActiveSession(
    _root,
    {},
    {
      models,
      user,
    }: { models: IModels; user: IUserDocument & ISession; subdomain: string },
  ) {
    const activeSession = await models.ActiveSessions.findOne({
      userId: user._id,
    });

    if (activeSession) {
      return activeSession;
    }

    await models.ActiveSessions.create({
      userId: user._id,
      lastLoginDeviceId: user.sessionCode,
    });

    return await models.ActiveSessions.findOne({
      userId: user._id,
    });
  },

  async callTerminateSession(_root, {}, { models, user, subdomain }: IContext) {
    await models.ActiveSessions.deleteOne({
      userId: user._id,
    });

    graphqlPubsub.publish(
      `sessionTerminateRequested:${subdomain}:${user._id}`,
      {
        userId: user._id,
      },
    );
    return user._id;
  },

  async callDisconnect(_root, {}, { models, user, subdomain }: IContext) {
    await models.ActiveSessions.deleteOne({
      userId: user._id,
    });

    graphqlPubsub.publish(
      `sessionTerminateRequested:${subdomain}:${user._id}`,
      {
        userId: user._id,
      },
    );

    return 'disconnected';
  },

  async callHistoryAdd(
    _root,
    doc: ICallHistory,
    { user, models, subdomain }: IContext,
  ) {
    const history = await acceptCall(
      models,
      subdomain,
      doc,
      user,
      'addHistory',
    );

    await putCreateLog(
      subdomain,
      {
        type: 'call',
        newData: doc,
        object: history,
        description: `Call "${history._id}" has been created`,
      },
      user,
    );

    return models.CallHistory.getCallHistory(history.sessionId);
  },

  /**
   * Updates a history
   */
  async callHistoryEdit(
    _root,
    { ...doc }: ICallHistoryEdit & { inboxIntegrationId: string },
    { user, models, subdomain }: IContext,
  ) {
    const { _id } = doc;
    const history = await models.CallHistory.findOne({
      _id,
    });

    if (history && history.callStatus === 'active') {
      await models.CallHistory.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } },
      );

      await putUpdateLog(
        subdomain,
        {
          type: 'call',
          object: history,
          newData: doc,
          description: `call ${history._id} has been edited`,
        },
        user,
      );
      const callRecordUrl = await getRecordUrl(doc, user, models, subdomain);
      if (callRecordUrl) {
        await models.CallHistory.updateOne(
          { _id },
          { $set: { recordUrl: callRecordUrl } },
        );
        return callRecordUrl;
      }

      return 'success';
    } else {
      throw new Error(`You cannot edit`);
    }
  },

  async callHistoryEditStatus(
    _root,
    { callStatus, sessionId }: { callStatus: String; sessionId: String },
    { user, models }: IContext,
  ) {
    if (sessionId && sessionId !== '') {
      await models.CallHistory.updateOne(
        { sessionId },
        {
          $set: {
            callStatus,
            modifiedAt: new Date(),
            modifiedBy: user._id,
          },
        },
      );
      return 'success';
    }
    throw new Error(`Cannot found session id`);
  },

  async callHistoryRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext,
  ) {
    const history = await models.CallHistory.findOneAndDelete({ _id });

    if (!history) {
      throw new Error(`Call history not found with id ${_id}`);
    }
    await putDeleteLog(
      subdomain,
      {
        type: 'call',
        object: history,
        description: `call "${history?._id}" has been deleted`,
      },
      user,
    );
    return history;
  },

  async callsUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  async callsPauseAgent(
    _root,
    { status, integrationId },
    { models, user }: IContext,
  ) {
    const integration = await models.Integrations.findOne({
      inboxId: integrationId,
    }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }
    const operator = integration.operators.find(
      (operator) => operator.userId === user?._id,
    );

    const extentionNumber = operator?.gsUsername || '1001';

    const queueData = (await sendToGrandStreamRequest(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'pauseUnpauseQueueAgent',
            operatetype: status,
            interface: extentionNumber,
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { need_apply } = queueData?.response;
      if (need_apply) {
        const operator = await models.Operators.getOperator(user._id);
        if (operator) {
          await models.Operators.updateOperator(user._id, status);
        } else if (!operator) {
          await models.Operators.create({
            userId: user._id,
            status,
            extension: extentionNumber,
          });
        }
        return need_apply;
      }
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
    console.log('11');

    const {
      response: listBridgedChannelsResponse,
      extentionNumber: extension,
    } = await sendToGrandStreamRequest(
      models,
      listBridgedChannelsPayload,
      user,
    );
    let channel = '';
    console.log('22', extension, extensionNumber);
    if (listBridgedChannelsResponse?.response) {
      const channels = listBridgedChannelsResponse.response.channel;
      console.log('33');
      if (channels) {
        console.log('44');

        const filteredChannels = channels.filter((ch) => {
          if (direction === 'incoming') {
            console.log('55');
            return ch.callerid2 === extension;
          } else {
            console.log('66');

            return ch.callerid1 === extension;
          }
        });
        if (filteredChannels.length > 0) {
          console.log('77');

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
    console.log('88');

    const callTransferResponse = await sendToGrandStreamRequest(
      models,
      callTransferPayload,
      user,
    );
    console.log('99');

    if (callTransferResponse?.response?.need_apply) {
      return callTransferResponse?.response?.need_apply;
    }

    return 'failed';
  },
};

export default callsMutations;
