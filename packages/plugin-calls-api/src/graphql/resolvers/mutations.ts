import { generateToken } from '../../utils';
import { IContext } from '../../connectionResolver';

import receiveCall from '../../receiveCall';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

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
    const customer = await receiveCall(models, subdomain, args);
    let conversation;
    if (args.callID) {
      conversation = await models.Conversations.findOne({
        callId: args.callID,
      });
    }

    return {
      customer: customer.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId,
      },
      conversation,
    };
  },

  async callUpdateActiveSession(_root, {}, { models, user }: IContext) {
    const activeSession = await models.ActiveSessions.findOne({
      userId: user._id,
    });

    if (activeSession) {
      return activeSession;
    }

    await models.ActiveSessions.create({
      userId: user._id,
    });

    return await models.ActiveSessions.findOne({
      userId: user._id,
    });
  },

  async callTerminateSession(_root, {}, { models, user }: IContext) {
    await models.ActiveSessions.deleteOne({
      userId: user._id,
    });

    graphqlPubsub.publish('sessionTerminateRequested', {
      userId: user._id,
    });
    return user._id;
  },

  async callDisconnect(_root, {}, { models, user }: IContext) {
    await models.ActiveSessions.deleteOne({
      userId: user._id,
    });

    graphqlPubsub.publish('sessionTerminateRequested', {
      userId: user._id,
    });

    return 'disconnected';
  },
};

export default callsMutations;
