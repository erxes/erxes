import { randomBytes } from 'crypto';
import { Db } from 'mongodb';

type ChannelDocument = {
  _id: string;
  name: string;
  scope?: string;
  createdAt?: Date;
};
type MemberDocument = {
  _id: string;
  channelId: string;
  memberId: string;
  role: string;
  createdAt: Date;
  createdBy?: string;
};
type UserDocument = { _id: string; isOwner?: boolean };

const TEAM_CHANNELS = { scope: { $ne: 'personal' } };

const randomId = (): string =>
  randomBytes(16).toString('base64url').slice(0, 21);

export const resolveChannelId = async (db: Db): Promise<string | undefined> => {
  if (process.env.STATIC_CHANNEL_ID) {
    return process.env.STATIC_CHANNEL_ID;
  }

  const channels = await db
    .collection<ChannelDocument>('channels')
    .find(TEAM_CHANNELS, { projection: { _id: 1, name: 1, createdAt: 1 } })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  if (channels.length === 0) {
    return undefined;
  }

  if (channels.length > 1) {
    console.log(
      `${channels.length} team channels; assigning to the oldest, "${channels[0].name}" (${channels[0]._id})`,
    );
  }

  return String(channels[0]._id);
};

export const requireChannelId = async (db: Db): Promise<string> => {
  const channelId = await resolveChannelId(db);

  if (!channelId) {
    throw new Error(
      'No channel to assign: set STATIC_CHANNEL_ID or run migrateChannel.ts first (it creates one when the target has none)',
    );
  }

  return channelId;
};

export const ensureDefaultChannel = async (
  db: Db,
): Promise<string | undefined> => {
  const channels = db.collection<ChannelDocument>('channels');
  const existing = await channels.countDocuments(TEAM_CHANNELS);

  if (existing > 0) {
    console.log(
      `Target already has ${existing} team channel(s); none created.`,
    );
    return undefined;
  }

  const users = await db
    .collection<UserDocument>('users')
    .find({ isActive: { $ne: false } }, { projection: { _id: 1, isOwner: 1 } })
    .toArray();
  const owner = users.find((user) => user.isOwner) || users[0];
  const now = new Date();
  const channelId = randomId();

  await channels.insertOne({
    _id: channelId,
    name: process.env.DEFAULT_CHANNEL_NAME || 'Support',
    scope: 'team',
    createdAt: now,
    createdBy: owner ? String(owner._id) : undefined,
    conversationCount: 0,
    openConversationCount: 0,
  } as ChannelDocument);

  if (users.length) {
    await db.collection<MemberDocument>('channel_members').insertMany(
      users.map((user) => ({
        _id: randomId(),
        channelId,
        memberId: String(user._id),
        role: owner && user._id === owner._id ? 'admin' : 'member',
        createdAt: now,
        createdBy: owner ? String(owner._id) : undefined,
      })),
    );
  }

  console.log(
    `Created channel "${
      process.env.DEFAULT_CHANNEL_NAME || 'Support'
    }" (${channelId}) with ${users.length} member(s).`,
  );

  return channelId;
};
