import { MongoClient, type Collection } from 'mongodb';
import { buildDiscordReactionUpdate } from '../messageEvents';

jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
}));

type Reaction = { senderId: string; emoji: string; reaction?: string };
type StoredMessage = {
  _id: string;
  reactions?: Reaction[];
  extraData?: { reactions?: Reaction[]; discordPinned?: boolean };
};

const mongoUrl = process.env.DISCORD_TEST_MONGO_URL;
const describeMongo = mongoUrl ? describe : describe.skip;

describeMongo('Discord reaction updates against MongoDB', () => {
  let client: MongoClient;
  let messages: Collection<StoredMessage>;

  beforeAll(async () => {
    client = new MongoClient(mongoUrl || '', {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    messages = client
      .db('discord_reaction_test')
      .collection<StoredMessage>('messages');
  });

  afterEach(async () => {
    await messages.deleteMany({});
  });

  afterAll(async () => {
    await client?.close();
  });

  it('preserves concurrent inbox and gateway additions in both reaction fields', async () => {
    await messages.insertOne({
      _id: 'message',
      extraData: { discordPinned: true },
    });
    await Promise.all([
      ...Array.from({ length: 20 }, (_, index) =>
        messages.updateOne(
          { _id: 'message' },
          buildDiscordReactionUpdate({
            senderId: `agent-${index}`,
            botId: 'bot',
            emoji: '👍',
            reaction: 'like',
            remove: false,
          }),
        ),
      ),
      ...Array.from({ length: 10 }, (_, index) =>
        messages.updateOne(
          { _id: 'message' },
          {
            $addToSet: {
              reactions: { senderId: `customer-${index}`, emoji: '❤️' },
              'extraData.reactions': {
                senderId: `customer-${index}`,
                emoji: '❤️',
              },
            },
          },
        ),
      ),
    ]);
    const stored = await messages.findOne({ _id: 'message' });
    expect(stored?.reactions).toHaveLength(30);
    expect(stored?.extraData?.reactions).toEqual(stored?.reactions);
    expect(stored?.extraData?.discordPinned).toBe(true);
  });

  it('removes only the target emoji for the actor and the reflected bot', async () => {
    const reactions = [
      { senderId: 'agent', emoji: '👍' },
      { senderId: 'agent', emoji: '❤️' },
      { senderId: 'bot', emoji: '👍' },
      { senderId: 'customer', emoji: '👍' },
    ];
    await messages.insertOne({
      _id: 'message',
      reactions,
      extraData: { reactions },
    });
    await messages.updateOne(
      { _id: 'message' },
      buildDiscordReactionUpdate({
        senderId: 'agent',
        botId: 'bot',
        emoji: '👍',
        reaction: 'like',
        remove: true,
      }),
    );
    const stored = await messages.findOne({ _id: 'message' });
    expect(stored?.reactions).toEqual([reactions[1], reactions[3]]);
    expect(stored?.extraData?.reactions).toEqual(stored?.reactions);
  });

  it('preserves legacy root reactions and treats dollar-prefixed values as literals', async () => {
    const existing = { senderId: 'customer', emoji: '👍' };
    await messages.insertOne({ _id: 'message', reactions: [existing] });
    const update = buildDiscordReactionUpdate({
      senderId: '$agent',
      botId: 'bot',
      emoji: '$emoji',
      reaction: '$reaction',
      remove: false,
    });
    await messages.updateOne({ _id: 'message' }, update);
    await messages.updateOne({ _id: 'message' }, update);
    const stored = await messages.findOne({ _id: 'message' });
    expect(stored?.reactions).toEqual([
      existing,
      { senderId: '$agent', emoji: '$emoji', reaction: '$reaction' },
    ]);
    expect(stored?.extraData?.reactions).toEqual(stored?.reactions);
  });
});
