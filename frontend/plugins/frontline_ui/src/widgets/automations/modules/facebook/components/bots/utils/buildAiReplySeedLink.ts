import {
  buildAutomationSeedLink,
  generateAutomationElementId,
} from 'ui-modules';
import {
  AI_AGENT_ACTION_TYPE,
  FACEBOOK_COMMENT_ACTION_TYPE,
  FACEBOOK_COMMENT_TRIGGER_TYPE,
  FACEBOOK_MESSAGE_ACTION_TYPE,
  FACEBOOK_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/facebook/components/bots/constants';

export type TAiReplyChannel = 'messenger' | 'comment';

export const isAiReplyChannel = (value: unknown): value is TAiReplyChannel =>
  value === 'messenger' || value === 'comment';

/**
 * Trigger → AI agent → reply. The agent only writes the text; the reply
 * action is what sends it to Facebook.
 */
export const buildAiReplySeedLink = ({
  channel,
  botId,
  botName,
  aiAgentId,
}: {
  channel: TAiReplyChannel;
  botId: string;
  botName?: string;
  aiAgentId: string;
}) => {
  const agentNodeId = generateAutomationElementId();
  const replyNodeId = generateAutomationElementId([agentNodeId]);
  const replyText = `{{ actions.${agentNodeId}.text }}`;

  const agentNode = {
    id: agentNodeId,
    type: AI_AGENT_ACTION_TYPE,
    nextActionId: replyNodeId,
    config: {
      aiAgentId,
      goalType: 'generateText',
      input: '{{ trigger.content }}',
    },
  };

  if (channel === 'comment') {
    return buildAutomationSeedLink({
      triggerType: FACEBOOK_COMMENT_TRIGGER_TYPE,
      triggerConfig: { botId, postType: 'any', onlyFirstLevel: true },
      actions: [
        agentNode,
        {
          id: replyNodeId,
          type: FACEBOOK_COMMENT_ACTION_TYPE,
          config: { texts: [replyText] },
        },
      ],
      name: botName ? `${botName} · AI comment reply` : undefined,
    });
  }

  return buildAutomationSeedLink({
    triggerType: FACEBOOK_MESSAGE_TRIGGER_TYPE,
    triggerConfig: {
      botId,
      // A direct condition without keyword rules answers any text.
      conditions: [
        {
          _id: generateAutomationElementId(),
          type: 'direct',
          isSelected: true,
          conditions: [],
        },
      ],
    },
    actions: [
      agentNode,
      {
        id: replyNodeId,
        type: FACEBOOK_MESSAGE_ACTION_TYPE,
        config: {
          messages: [
            {
              _id: generateAutomationElementId(),
              type: 'text',
              text: replyText,
              buttons: [],
            },
          ],
        },
      },
    ],
    name: botName ? `${botName} · AI messenger reply` : undefined,
  });
};
