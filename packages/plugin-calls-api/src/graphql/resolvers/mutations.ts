import { generateToken } from '../../utils';
import { IContext, IModels } from '../../connectionResolver';

import receiveCall from '../../receiveCall';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { ICallHistory } from '../../models/definitions/callHistories';
import { sendInboxMessage } from '../../messageBroker';
import { updateConfigs } from '../../helpers';

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

  async callAddCustomer(_root, args, { models, subdomain, user }: IContext) {
    const customer = await receiveCall(models, subdomain, args, user);
    let conversation;
    if (args.callID) {
      conversation = await models.Conversations.findOne({
        callId: args.callID,
      }).lean();
    }
    if (conversation && conversation.integrationId) {
      const channels = await sendInboxMessage({
        subdomain,
        action: 'channels.find',
        data: {
          integrationIds: { $in: [conversation.integrationId] },
        },
        isRPC: true,
      });

      if (channels && channels.length > 0) {
        conversation = {
          ...conversation,
          channels: channels,
        };
      }
    }

    return {
      customer: customer.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId,
      },
      conversation,
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
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const history = await models.CallHistory.create({
      ...docModifier({ ...doc }),
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id,
    });

    return models.CallHistory.getCallHistory(history.sessionId);
  },

  /**
   * Updates a history
   */
  async callHistoryEdit(
    _root,
    { ...doc }: ICallHistoryEdit,
    { user, models }: IContext,
  ) {
    await models.CallHistory.updateOne(
      { sessionId: doc.sessionId },
      { $set: { ...doc, updatedAt: new Date(), updatedBy: user._id } },
    );

    return models.CallHistory.getCallHistory(doc.sessionId);
  },

  async callHistoryRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const history = await models.CallHistory.findOne({ _id });

    if (!history) {
      throw new Error(`Call history not found with id ${_id}`);
    }

    return history.remove();
  },

  async callsUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },
};

export default callsMutations;
