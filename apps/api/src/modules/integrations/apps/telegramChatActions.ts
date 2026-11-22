import type { ActionField } from '@erxes/core-contract';
import { TELEGRAM_JOIN_DECISIONS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, Text } from '@erxes/plugin-sdk/integrations';
import { call, type TelegramKeys } from './telegramApi';
import { ChatId, chatField, done, UserId, userField } from './telegramFields';
import { CHAT } from './telegramOutputs';
import { Chat, chatOf, inChat, Member } from './telegramUsers';

const ADMINS = new Set(['creator', 'administrator']);

const groupField: ActionField = {
  ...chatField(),
  description: 'A group or channel id, or @username of a channel',
};

const ChatRef = z.object({ chatId: ChatId });

const ChatInfo = Chat.extend({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  description: z.string().optional(),
  bio: z.string().optional(),
  invite_link: z.string().optional(),
}).transform((chat) => ({
  ...chatOf(chat),
  firstName: chat.first_name ?? null,
  lastName: chat.last_name ?? null,
  description: chat.description ?? chat.bio ?? null,
  inviteLink: chat.invite_link ?? null,
}));

const getChat = appAction<TelegramKeys, z.output<typeof ChatRef>>({
  key: 'get_chat',
  label: 'Get a chat',
  description: "Look up a chat's title, type, description and invite link",
  fields: [chatField()],
  outputs: [
    ...CHAT,
    { key: 'firstName', label: 'First name, in a private chat', type: 'text' },
    { key: 'lastName', label: 'Last name, in a private chat', type: 'text' },
    { key: 'description', label: 'Description or bio', type: 'text' },
    { key: 'inviteLink', label: 'Invite link', type: 'text' },
  ],
  input: ChatRef,
  run: ({ client: bot, input }) => call(bot, 'getChat', ChatInfo, { chat_id: input.chatId }),
});

const Admins = z
  .array(
    z.object({
      status: z.string(),
      user: z.object({ id: Text, username: z.string().optional(), is_bot: z.boolean() }),
    }),
  )
  .transform((members) => {
    const people = members.filter((member) => !member.user.is_bot);

    return {
      ownerId: people.find((member) => member.status === 'creator')?.user.id ?? null,
      adminIds: people.map((member) => member.user.id),
      adminUsernames: people.flatMap((member) => member.user.username ?? []),
      count: people.length,
    };
  });

const getAdmins = appAction<TelegramKeys, z.output<typeof ChatRef>>({
  key: 'get_admins',
  label: 'Get the admins of a chat',
  description: "List a group's or channel's admins, other bots left out",
  fields: [groupField],
  outputs: [
    { key: 'ownerId', label: 'Owner id', type: 'text' },
    { key: 'adminIds', label: 'Admin ids', type: 'list' },
    { key: 'adminUsernames', label: 'Admin usernames', type: 'list' },
    { key: 'count', label: 'Number of admins', type: 'number' },
  ],
  input: ChatRef,
  run: ({ client: bot, input }) =>
    call(bot, 'getChatAdministrators', Admins, { chat_id: input.chatId }),
});

const MemberRef = ChatRef.extend({ userId: UserId });

const MemberInfo = Member.transform((member) => ({
  memberId: member.user.id,
  memberUsername: member.user.username ?? null,
  memberFirstName: member.user.first_name ?? null,
  memberLastName: member.user.last_name ?? null,
  status: member.status,
  isMember: inChat(member),
  isAdmin: ADMINS.has(member.status),
}));

const getMember = appAction<TelegramKeys, z.output<typeof MemberRef>>({
  key: 'get_member',
  label: 'Check a member',
  description: 'Find out whether someone is in a group or channel, and whether they are an admin',
  fields: [groupField, userField],
  outputs: [
    { key: 'isMember', label: 'Is in the chat', type: 'boolean' },
    { key: 'isAdmin', label: 'Is an admin', type: 'boolean' },
    {
      key: 'status',
      label: 'Status (creator, administrator, member, restricted, left, kicked)',
      type: 'text',
    },
    { key: 'memberId', label: 'Member id', type: 'text' },
    { key: 'memberUsername', label: 'Member username', type: 'text' },
    { key: 'memberFirstName', label: 'Member first name', type: 'text' },
    { key: 'memberLastName', label: 'Member last name', type: 'text' },
  ],
  input: MemberRef,
  run: ({ client: bot, input }) =>
    call(bot, 'getChatMember', MemberInfo, { chat_id: input.chatId, user_id: input.userId }),
});

const leaveChat = appAction<TelegramKeys, z.output<typeof ChatRef>>({
  key: 'leave_chat',
  label: 'Leave a chat',
  description: 'The bot leaves a group or channel',
  fields: [groupField],
  input: ChatRef,
  run: ({ client: bot, input }) =>
    done(call(bot, 'leaveChat', z.literal(true), { chat_id: input.chatId })),
});

const TitleInput = ChatRef.extend({ title: Text.pipe(z.string().trim().min(1).max(128)) });

const setTitle = appAction<TelegramKeys, z.output<typeof TitleInput>>({
  key: 'set_chat_title',
  label: 'Rename a chat',
  description: 'Change the title of a group or channel where the bot is an admin',
  fields: [groupField, { key: 'title', label: 'New title', type: 'text', required: true }],
  input: TitleInput,
  run: ({ client: bot, input }) =>
    done(call(bot, 'setChatTitle', z.literal(true), { chat_id: input.chatId, title: input.title })),
});

const DescriptionInput = ChatRef.extend({
  description: Text.pipe(z.string().max(255)).optional(),
});

const setDescription = appAction<TelegramKeys, z.output<typeof DescriptionInput>>({
  key: 'set_chat_description',
  label: 'Change a chat description',
  description: 'Change the description of a group or channel where the bot is an admin',
  fields: [
    groupField,
    {
      key: 'description',
      label: 'New description',
      type: 'longtext',
      required: false,
      description: 'Up to 255 characters. Blank: no description.',
    },
  ],
  input: DescriptionInput,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'setChatDescription', z.literal(true), {
        chat_id: input.chatId,
        description: input.description ?? '',
      }),
    ),
});

const JoinInput = MemberRef.extend({ decision: z.enum(TELEGRAM_JOIN_DECISIONS) });

const answerJoin = appAction<TelegramKeys, z.output<typeof JoinInput>>({
  key: 'answer_join_request',
  label: 'Answer a join request',
  description: 'Let someone into a group or channel, or turn them down. Use it after Join request.',
  fields: [
    groupField,
    userField,
    {
      key: 'decision',
      label: 'Answer',
      type: 'select',
      required: true,
      options: [
        { value: 'approve', label: 'Let them in' },
        { value: 'decline', label: 'Turn them down' },
      ],
    },
  ],
  input: JoinInput,
  run: ({ client: bot, input }) =>
    done(
      call(
        bot,
        input.decision === 'approve' ? 'approveChatJoinRequest' : 'declineChatJoinRequest',
        z.literal(true),
        { chat_id: input.chatId, user_id: input.userId },
      ),
    ),
});

const RemoveInput = MemberRef.extend({ rejoin: z.boolean().optional() });

const removeMember = appAction<TelegramKeys, z.output<typeof RemoveInput>>({
  key: 'remove_member',
  label: 'Remove a member',
  description: 'Remove someone from a group or channel where the bot is an admin',
  fields: [
    groupField,
    userField,
    {
      key: 'rejoin',
      label: 'Let them join again',
      type: 'boolean',
      required: false,
      description: 'Off: they are banned until an admin lets them back',
    },
  ],
  input: RemoveInput,
  async run({ client: bot, input }) {
    const member = { chat_id: input.chatId, user_id: input.userId };

    await call(bot, 'banChatMember', z.literal(true), member);

    if (input.rejoin)
      await call(bot, 'unbanChatMember', z.literal(true), { ...member, only_if_banned: true });

    return {};
  },
});

export const CHAT_ACTIONS = [
  getChat,
  getAdmins,
  getMember,
  answerJoin,
  removeMember,
  setTitle,
  setDescription,
  leaveChat,
];
