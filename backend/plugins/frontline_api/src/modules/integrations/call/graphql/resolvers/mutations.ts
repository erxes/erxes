import {
  createOrUpdateErxesConversation,
  findIntegration,
  getRecordUrl,
  sendToGrandStream,
} from '../../utils';

import { IContext } from '~/connectionResolvers';
import acceptCall from '../../acceptCall';
import { saveRecordUrl, getOrCreateCustomer } from '../../store';
import { redlock } from '../../redlock';
import {
  ICallHistory,
  ICallHistoryEdit,
} from '@/integrations/call/@types/histories';
import { getEnv, graphqlPubsub } from 'erxes-api-shared/utils';

export interface ISession {
  sessionCode: string;
}

const callsMutations = {
  async callsIntegrationUpdate(_root, { configs }, { models }: IContext) {
    const { inboxId, ...data } = configs;

    const integration = await models.CallIntegrations.findOneAndUpdate(
      { inboxId },
      { $set: { ...data } },
    );
    return integration;
  },

  async callAddCustomer(_root, args, { models, subdomain }: IContext) {
    const integration = await findIntegration(subdomain, args);
    const customer = await getOrCreateCustomer(models, subdomain, args);

    const channels = await models.Channels.find({
      integrationIds: { $in: [integration.inboxId] },
    });

    return {
      customer: customer?.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId,
      },
      channels,
    };
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

    return models.CallHistory.getCallHistory(history);
  },

  async callHistoryEdit(
    _root,
    { ...doc }: ICallHistoryEdit & { inboxIntegrationId: string },
    { user, models, subdomain }: IContext,
  ) {
    const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
    if (ENDPOINT_URL) {
      return;
    }
    const { _id } = doc;
    const history = await models.CallHistory.findOne({
      _id,
    });
    if (history && history.callStatus === 'active') {
      let callStatus = doc.callStatus;
      if (doc.transferredCallStatus) {
        callStatus = 'transferred';
      }

      await models.CallHistory.deleteMany({
        timeStamp: doc.timeStamp,
        callStatus: 'cancelled',
      });
      if (doc.timeStamp === 0) {
        doc.timeStamp = Date.now().toString();
      }
      await models.CallHistory.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
            modifiedBy: user._id,
            callStatus: callStatus,
          },
        },
      );

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      await models.CallHistory.updateMany(
        {
          customerPhone: doc.customerPhone,
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
          callStatus: 'cancelled',
        },
        {
          $set: {
            modifiedAt: new Date(),
            modifiedBy: user._id,
            callStatus: 'cancelledToAnswered',
          },
        },
      );
      const callRecordUrl = await getRecordUrl(doc, user, models, subdomain);
      if (
        callRecordUrl &&
        callRecordUrl !== 'Check the transferred call record URL!'
      ) {
        await models.CallHistory.updateOne(
          { _id },
          { $set: { recordUrl: callRecordUrl } },
        );
        return callRecordUrl;
      }
      if (callRecordUrl === 'Check the transferred call record URL!') {
        return callRecordUrl;
      }
      return 'success';
    } else if (
      doc.callStatus === 'cancelled' &&
      doc.timeStamp &&
      doc.timeStamp !== 0
    ) {
      const cancelledCall = await models.CallHistory.findOne({
        timeStamp: doc.timeStamp,
      });
      if (cancelledCall) {
        return 'This history already exists';
      }
      const integration = await findIntegration(subdomain, {
        inboxIntegrationId: doc.inboxIntegrationId,
        queueName: doc.queueName,
      });

      const operator = integration.operators.find(
        (operator) => operator.userId === user?._id,
      );
      if (!operator) throw new Error('Operator not found');

      const lockKey = `${subdomain}:call:history:${doc.timeStamp}`;
      let lock;

      try {
        lock = await redlock.acquire([lockKey], 60000);
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        const oldHistory = await models.CallHistory.findOne({
          customerPhone: doc.customerPhone,
          callStatus: doc.callStatus,
          createdAt: { $gte: twoMinutesAgo },
        });

        if (oldHistory) return 'Call history already exists';

        const history = new models.CallHistory({
          ...doc,
          extensionNumber: operator.gsUsername,
          operatorPhone: integration.phone,
          createdAt: new Date(),
          createdBy: doc.endedBy ? user._id : null,
          updatedBy: doc.endedBy ? user._id : null,
        });

        await history.save();

        let customer = await models.CallCustomers.findOne({
          primaryPhone: doc.customerPhone,
        });
        if (!customer || !customer.erxesApiId) {
          customer = await getOrCreateCustomer(models, subdomain, doc);
        }

        // Update conversation via API
        try {
          const payload = JSON.stringify({
            customerId: customer?.erxesApiId,
            integrationId: integration.inboxId,
            content: doc.callType || '',
            conversationId: history.conversationId,
            updatedAt: new Date(),
            owner: '',
          });

          const apiConversationResponse = await createOrUpdateErxesConversation(
            subdomain,
            payload,
          );

          if (apiConversationResponse.status === 'success') {
            history.conversationId = apiConversationResponse?.data._id;
            await history.save();
          }
        } catch (e) {
          await models.CallHistory.deleteOne({ _id: history._id });
          throw new Error(`Failed to update conversation: ${e.message}`);
        }

        await graphqlPubsub.publish(
          `conversationMessageInserted:${history.conversationId}`,
          {
            conversationMessageInserted: {
              ...history.toObject(),
              conversationId: history.conversationId,
            },
          },
        );

        return 'Successfully edited';
      } catch (e) {
        throw new Error(`Error processing call history: ${e.message}`);
      } finally {
        if (lock) {
          try {
            await lock.unlock();
          } catch (unlockError) {
            console.error('Failed to release lock:', unlockError);
          }
        }
      }
    } else {
      throw new Error(`You cannot edit`);
    }
  },

  async callHistoryEditStatus(
    _root,
    { callStatus, timeStamp }: { callStatus: string; timeStamp: number },
    { user, models }: IContext,
  ) {
    if (timeStamp && timeStamp !== 0) {
      await models.CallHistory.updateOne(
        { timeStamp },
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
    { models }: IContext,
  ) {
    const history = await models.CallHistory.findOneAndDelete({ _id });

    if (!history) {
      throw new Error(`Call history not found with id ${_id}`);
    }

    return history;
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
          retryCount: 1,
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
