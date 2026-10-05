import {
  mapMessageCreateToActivity,
  resolveDiscordMentions,
} from '../activity';

describe('Discord message activity', () => {
  it('normalizes mentions inside forwarded snapshots and does not mark a forward as a reply', () => {
    const activity = mapMessageCreateToActivity({
      id: 'message',
      channel_id: 'channel',
      message_reference: { type: 1, message_id: 'source' },
      message_snapshots: [
        {
          message: {
            content: 'Hello <@123> <:wave:456>',
            mentions: [
              {
                id: '123',
                username: 'Alice',
                discriminator: '0',
                avatar: null,
                global_name: null,
              },
            ],
          },
        },
      ],
    });
    expect(activity.forwardedSnapshot?.content).toBe('Hello @Alice :wave:');
    expect(activity.replyTo).toBeUndefined();
  });

  it('keeps the reply ID when Discord omits the referenced message', () => {
    const activity = mapMessageCreateToActivity({
      id: 'message',
      message_reference: { message_id: 'source' },
      referenced_message: null,
    });
    expect(activity.replyTo?.messageId).toBe('source');
    expect(activity.replyTo?.content).toBeUndefined();
  });

  it('uses a readable fallback for users missing from the mention payload', () => {
    expect(resolveDiscordMentions('Hello <@123>')).toBe('Hello @unknown-user');
  });
});
