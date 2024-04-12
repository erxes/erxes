import { generateToken } from '../../utils';
import { IContext, IModels } from '../../connectionResolver';

import receiveCall from '../../receiveCall';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { ICallHistory } from '../../models/definitions/callHistories';
import { sendInboxMessage } from '../../messageBroker';
import { updateConfigs } from '../../helpers';
import { getOrCreateCustomer } from '../../store';

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
    args.recipientId = integration.phone;
    const customer = await getOrCreateCustomer(models, subdomain, args);

    const channels = await sendInboxMessage({
      subdomain,
      action: 'channels.find',
      data: {
        integrationIds: { $in: [integration._id] },
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
    { user, docModifier, models, subdomain }: IContext,
  ) {
    // const history = await models.CallHistory.create({
    //   ...docModifier({ ...doc }),
    //   createdAt: new Date(),
    //   createdBy: user._id,
    //   updatedBy: user._id,
    // });
    const history = await receiveCall(
      models,
      subdomain,
      doc,
      user,
      docModifier,
    );
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
    const { conversationId } = doc;
    if (conversationId && conversationId !== '') {
      const history = await models.CallHistory.findOne({
        conversationId: doc.conversationId,
      });

      if (
        history &&
        history.callStatus === 'active' &&
        history.acceptedUserId === user._id
      ) {
        await models.CallHistory.updateOne(
          { conversationId: doc.conversationId },
          { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } },
        );
        return 'success';
      }
      throw new Error(`You cannot edit`);
    }
    throw new Error(`Cannot found conversation Id`);
  },

  async callHistoryEditStatus(
    _root,
    {
      callStatus,
      conversationId,
    }: { callStatus: String; conversationId: String },
    { user, models }: IContext,
  ) {
    if (conversationId && conversationId !== '') {
      await models.CallHistory.updateOne(
        { conversationId },
        {
          $set: {
            callStatus,
            modifiedAt: new Date(),
            modifiedBy: user._id,
            acceptedUserId: user._id,
          },
        },
      );
      return 'success';
    }
    throw new Error(`Cannot found conversation Id`);
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
