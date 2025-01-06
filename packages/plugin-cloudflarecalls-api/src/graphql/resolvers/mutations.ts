import { IContext } from '../../connectionResolver';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { updateConfigs } from '../../helpers';
import receiveCall from '../../receiveCall';
export interface ISession {
  sessionCode: string;
}

const callsMutations = {
  async cloudflareMakeCall(
    _root,
    {
      callerNumber,
      roomState,
      audioTrack,
      integrationId,
    }: {
      callerNumber: string;
      roomState: string;
      audioTrack: string;
      integrationId: string;
    },
    { user, models, subdomain }: IContext,
  ) {
    await receiveCall(
      models,
      subdomain,
      {
        callerNumber,
        audioTrack,
        integrationId,
      },
      user,
    );

    const integration = await models.Integrations.findOne({
      erxesApiId: integrationId,
    }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }
    integration.operators.map((operator) => {
      graphqlPubsub.publish('cloudflareReceiveCall', {
        cloudflareReceiveCall: {
          callerNumber,
          roomState: 'ready',
          audioTrack,
          userId: operator.userId,
        },
      });
    });

    return '';
  },
  async cloudflareAnswerCall(
    _root,
    {
      roomState,
      audioTrack,
      customerAudioTrack,
    }: {
      roomState: string;
      audioTrack: string;
      customerAudioTrack: string;
    },
    { user, models }: IContext,
  ) {
    await models.CallHistory.updateOne(
      { customerAudioTrack },
      { $set: { acceptedUserId: user._id, callStatus: 'active' } },
    );
    await graphqlPubsub.publish('cloudflareReceivedCall', {
      cloudflareReceivedCall: {
        roomState,
        audioTrack,
      },
    });

    return '';
  },

  async cloudflareLeaveCall(
    _root,
    {
      roomState,
      originator,
      duration,
      audioTrack,
    }: {
      roomState: string;
      originator: string;
      duration: number;
      audioTrack: string;
    },
    { models }: IContext,
  ) {
    if (originator === 'web' && audioTrack) {
      const history = await models.CallHistory.findOne({
        customerAudioTrack: audioTrack,
      });
      if (history) {
        await models.CallHistory.updateOne(
          {
            customerAudioTrack: audioTrack,
          },
          {
            $set: {
              callDuration: duration,
              callStatus: 'answered',
              endedBy: 'customer',
            },
          },
        );
      }
      await graphqlPubsub.publish('cloudflareReceiveCall', {
        cloudflareReceiveCall: {
          roomState: 'leave',
        },
      });
      return 'success';
    }
    if (originator === 'erxes' && audioTrack) {
      const history = await models.CallHistory.findOne({
        customerAudioTrack: audioTrack,
      });
      if (history) {
        await models.CallHistory.updateOne(
          {
            customerAudioTrack: audioTrack,
          },
          {
            $set: {
              callDuration: duration,
              callStatus: 'answered',
              endedBy: 'operator',
            },
          },
        );
      }
      await graphqlPubsub.publish('cloudflareReceivedCall', {
        cloudflareReceivedCall: {
          roomState: 'leave',
        },
      });
      return 'success';
    }

    return 'failed';
  },

  async cloudflareCallsUpdateConfigs(
    _root,
    { configsMap },
    { models }: IContext,
  ) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },
};

export default callsMutations;
