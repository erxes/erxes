import { toMessage } from '../toMessage';

test('nulls become undefined and required text falls back to empty', () => {
  const message = toMessage({
    _id: 'm1',
    content: null,
    createdAt: null,
    customerId: null,
    internal: null,
    providerData: null,
    replyTo: null,
    reactions: null,
    extraData: null,
  });

  expect(message).toMatchObject({ _id: 'm1', content: '', createdAt: '' });
  expect(message.customerId).toBeUndefined();
  expect(message.internal).toBeUndefined();
  expect(message.providerData).toBeUndefined();
  expect(message.replyTo).toBeUndefined();
  expect(message.reactions).toBeUndefined();
  expect(message.extraData).toBeUndefined();
});

test('a reply without a message id and a reaction without a sender are dropped', () => {
  const message = toMessage({
    _id: 'm2',
    replyTo: { messageId: null, content: 'quoted', authorName: 'Ann' },
    reactions: [
      { senderId: 's1', emoji: '👍', reaction: null },
      { senderId: null, emoji: '❤️', reaction: null },
    ],
  });

  expect(message.replyTo).toBeUndefined();
  expect(message.reactions).toEqual([{ senderId: 's1', emoji: '👍' }]);
});

test('extra data keeps undeclared keys so forwarded snapshots lose nothing', () => {
  const message = toMessage({
    _id: 'm3',
    extraData: {
      discordMessageId: 'd1',
      discordPinned: true,
      providerOnly: { keep: 1 },
      embeds: [
        { title: 'Link', image: { url: 'https://a/b.png', extra: 'x' } },
      ],
      poll: { question: 'Lunch?', answers: [{ id: 1, text: 'Yes' }, 'bad'] },
    },
  });

  expect(message.extraData).toMatchObject({
    discordMessageId: 'd1',
    discordPinned: true,
    providerOnly: { keep: 1 },
    embeds: [{ title: 'Link', image: { url: 'https://a/b.png', extra: 'x' } }],
    poll: { question: 'Lunch?', answers: [{ id: 1, text: 'Yes' }] },
  });
});

test('a malformed extra data leaf falls back without dropping its siblings', () => {
  const message = toMessage({
    _id: 'm4',
    messageKind: 'not-a-kind',
    extraData: { discordPinned: 'yes', discordMessageId: 'd2' },
  });

  expect(message.messageKind).toBeUndefined();
  expect(message.extraData?.discordPinned).toBeUndefined();
  expect(message.extraData?.discordMessageId).toBe('d2');
});

test('keeps the provider content type and normalizes a nullable value', () => {
  expect(toMessage({ _id: 'photo', contentType: 'image' }).contentType).toBe(
    'image',
  );
  expect(
    toMessage({ _id: 'text', contentType: null }).contentType,
  ).toBeUndefined();
});
