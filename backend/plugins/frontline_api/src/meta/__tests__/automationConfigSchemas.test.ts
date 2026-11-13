import {
  toAutomationConfigIssues,
  toTransportConfigSchema,
} from 'erxes-api-shared/core-modules';
import {
  discordMessageActionConfigSchema,
  mailReplyActionConfigSchema,
  messengerMessageActionConfigSchema,
  socialCommentActionConfigSchema,
  socialMessageActionConfigSchema,
  ticketCreateActionConfigSchema,
} from '../automationConfigSchemas';

const issuePaths = (result: {
  error?: { issues: { path: PropertyKey[] }[] };
}) => (result.error?.issues || []).map(({ path }) => path.join('.'));

describe('frontline action configs', () => {
  it('accepts bot messages as the builder writes them, buttons linked as branches', () => {
    const config = {
      messages: [
        {
          _id: 'm1',
          type: 'text',
          text: 'Hi {{ trigger.firstName }}',
          buttons: [{ _id: 'b1', text: 'Pricing', type: 'button' }],
        },
      ],
      optionalConnects: [{ optionalConnectId: 'b1', actionId: 'a2' }],
    };

    expect(messengerMessageActionConfigSchema.safeParse(config).success).toBe(
      true,
    );
    expect(socialMessageActionConfigSchema.safeParse(config).success).toBe(
      true,
    );
    expect(
      issuePaths(socialMessageActionConfigSchema.safeParse({ messages: [] })),
    ).toEqual(['messages']);
  });

  it('needs a reply for a comment, a target for discord and content for mail', () => {
    expect(
      issuePaths(socialCommentActionConfigSchema.safeParse({ texts: [' '] })),
    ).toEqual(['texts']);
    expect(
      socialCommentActionConfigSchema.safeParse({ text: 'Thanks!' }).success,
    ).toBe(true);
    expect(
      issuePaths(
        discordMessageActionConfigSchema.safeParse({
          target: 'channel',
          content: 'Hi',
        }),
      ),
    ).toEqual(['botId', 'channelId']);
    expect(
      issuePaths(mailReplyActionConfigSchema.safeParse({ content: ' ' })),
    ).toEqual(['content']);
  });

  it('needs the channel, pipeline and status of a ticket, and a name', () => {
    expect(
      issuePaths(ticketCreateActionConfigSchema.safeParse({ channelId: 'c1' })),
    ).toEqual(['pipelineId', 'statusId']);
    expect(
      ticketCreateActionConfigSchema.safeParse({
        channelId: 'c1',
        pipelineId: 'p1',
        statusId: 's1',
        cardName: '{{ trigger.content }}',
      }).success,
    ).toBe(true);
  });

  it('calls a bare number where the builder writes a choice token malformed', () => {
    const config = {
      channelId: 'c1',
      pipelineId: 'p1',
      statusId: 's1',
      name: 'Ticket',
      priority: 2,
    };
    const parsed = ticketCreateActionConfigSchema.safeParse(config);

    expect(
      parsed.success ? [] : toAutomationConfigIssues(parsed.error, config),
    ).toMatchObject([{ path: 'config.priority', malformed: true }]);
  });

  it('publishes each contract as JSON schema', () => {
    expect(
      toTransportConfigSchema(ticketCreateActionConfigSchema),
    ).toMatchObject({ required: ['channelId', 'pipelineId', 'statusId'] });
  });
});
