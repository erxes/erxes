import { IContext } from '../../connectionResolver';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { updateConfigs } from '../../helpers';
import receiveCall from '../../receiveCall';
import { Department } from '../../models/definitions/integrations';
export interface ISession {
  sessionCode: string;
}

const callsMutations = {
  async cloudflareMakeCall(
    _root,
    {
      callerNumber,
      callerEmail,
      roomState,
      audioTrack,
      integrationId,
      departmentId,
    }: {
      callerNumber: string;
      callerEmail: string;
      roomState: string;
      audioTrack: string;
      integrationId: string;
      departmentId: string;
    },
    { user, models, subdomain }: IContext,
  ) {
    // Receive the call
    const history = await receiveCall(
      models,
      subdomain,
      {
        callerNumber,
        audioTrack,
        integrationId,
        departmentId,
        callerEmail,
      },
      user,
    );

    const integration = await models.Integrations.findOne({
      erxesApiId: integrationId,
    }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }

    const department = integration.departments?.find(
      (dept: Department) => dept._id.toString() === departmentId,
    );

    if (!department) {
      throw new Error(`Department not found`);
    }
    department.operators.forEach((operator) => {
      graphqlPubsub.publish('cloudflareReceiveCall', {
        cloudflareReceiveCall: {
          callerNumber,
          roomState: 'ready',
          audioTrack,
          userId: operator.userId,
          conversationId: history?.conversationId || '',
        },
      });
    });

    return 'Success';
  },
  async cloudflareAnswerCall(
    _root,
    {
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
        roomState: 'answered',
        audioTrack,
        customerAudioTrack,
      },
    });
    await graphqlPubsub.publish('cloudflareReceiveCall', {
      cloudflareReceiveCall: {
        roomState: 'answered',
        audioTrack,
        customerAudioTrack,
      },
    });

    return 'success';
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
          audioTrack,
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
          roomState: roomState,
          customerAudioTrack: audioTrack,
        },
      });

      await graphqlPubsub.publish('cloudflareReceiveCall', {
        cloudflareReceiveCall: {
          roomState,
          audioTrack,
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
