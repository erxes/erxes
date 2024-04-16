import { generateToken } from '../../utils';
import { IContext, IModels } from '../../connectionResolver';

import acceptCall from '../../acceptCall';
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
    const history = await acceptCall(models, subdomain, doc, user);
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
    const { _id, callStatus } = doc;
    const history = await models.CallHistory.findOne({
      _id,
    });

    if (history && history.callStatus === 'active') {
      await models.CallHistory.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } },
      );
      return 'success';
    }
    if (!history && (callStatus === 'cancelled' || callStatus === 'rejected')) {
      await acceptCall(models, subdomain, doc, user);
      return 'Call cancelled';
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
