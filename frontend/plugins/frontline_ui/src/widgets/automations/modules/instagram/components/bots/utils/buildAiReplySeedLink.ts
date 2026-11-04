import {
  buildAutomationSeedLink,
  generateAutomationElementId,
} from 'ui-modules';
import {
  AI_AGENT_ACTION_TYPE,
  INSTAGRAM_COMMENT_ACTION_TYPE,
  INSTAGRAM_COMMENT_TRIGGER_TYPE,
  INSTAGRAM_MESSAGE_ACTION_TYPE,
  INSTAGRAM_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/instagram/components/bots/constants';

export type TInstagramAiReplyChannel = 'messenger' | 'comment';

export const isInstagramAiReplyChannel = (
  value: unknown,
): value is TInstagramAiReplyChannel =>
  value === 'messenger' || value === 'comment';

export const buildInstagramAiReplySeedLink = ({
  channel,
  botId,
  botName,
  aiAgentId,
}: {
  channel: TInstagramAiReplyChannel;
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
      triggerType: INSTAGRAM_COMMENT_TRIGGER_TYPE,
      triggerConfig: { botId, postType: 'any', onlyFirstLevel: true },
      actions: [
        agentNode,
        {
          id: replyNodeId,
          type: INSTAGRAM_COMMENT_ACTION_TYPE,
          config: { text: replyText },
        },
      ],
      name: botName ? `${botName} · AI comment reply` : undefined,
    });
  }

  return buildAutomationSeedLink({
    triggerType: INSTAGRAM_MESSAGE_TRIGGER_TYPE,
    triggerConfig: {
      botId,
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
        type: INSTAGRAM_MESSAGE_ACTION_TYPE,
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
