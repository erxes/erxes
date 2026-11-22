import { z } from 'zod';
import { Text } from '@erxes/plugin-sdk/integrations';
import { Message, messageFields } from './telegramMessage';
import { at, Chat, chatOf, fromOf, inChat, Member, User } from './telegramUsers';

const MessageUpdate = Message.transform(messageFields);

const InviteLink = z.object({ invite_link: z.string(), name: z.string().optional() });

const ButtonPress = z
  .object({
    id: z.string(),
    from: User,
    data: z.string().optional(),
    inline_message_id: z.string().optional(),
    chat_instance: z.string().optional(),
    message: z
      .looseObject({
        message_id: Text,
        chat: Chat,
        text: z.string().optional(),
        caption: z.string().optional(),
      })
      .optional(),
  })
  .transform((query) => ({
    callbackQueryId: query.id,
    data: query.data,
    messageId: query.message?.message_id,
    messageText: query.message?.text ?? query.message?.caption,
    inlineMessageId: query.inline_message_id,
    chatInstance: query.chat_instance,
    ...chatOf(query.message?.chat),
    ...fromOf(query.from),
  }));

const InlineQuery = z
  .object({
    id: z.string(),
    from: User,
    query: z.string(),
    offset: z.string().optional(),
    chat_type: z.string().optional(),
    location: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  })
  .transform((query) => ({
    inlineQueryId: query.id,
    query: query.query,
    offset: query.offset || undefined,
    chatType: query.chat_type,
    latitude: query.location?.latitude,
    longitude: query.location?.longitude,
    ...fromOf(query.from),
  }));

const PollAnswer = z
  .object({
    poll_id: z.string(),
    user: User.optional(),
    voter_chat: Chat.optional(),
    option_ids: z.array(Text),
  })
  .transform((answer) => ({
    pollId: answer.poll_id,
    optionIds: answer.option_ids,
    voterChatId: answer.voter_chat?.id,
    voterChatTitle: answer.voter_chat?.title,
    ...fromOf(answer.user),
  }));

const JoinRequest = z
  .object({
    chat: Chat,
    from: User,
    user_chat_id: Text.optional(),
    date: z.number(),
    bio: z.string().optional(),
    invite_link: InviteLink.optional(),
  })
  .transform((request) => ({
    date: at(request.date),
    bio: request.bio,
    userChatId: request.user_chat_id,
    inviteLink: request.invite_link?.invite_link,
    inviteLinkName: request.invite_link?.name,
    ...chatOf(request.chat),
    ...fromOf(request.from),
  }));

const MemberChange = z
  .object({
    chat: Chat,
    from: User,
    date: z.number(),
    old_chat_member: Member,
    new_chat_member: Member,
    invite_link: InviteLink.optional(),
    via_join_request: z.boolean().optional(),
  })
  .transform((change) => {
    const member = change.new_chat_member;

    return {
      date: at(change.date),
      memberId: member.user.id,
      memberUsername: member.user.username,
      memberFirstName: member.user.first_name,
      memberLastName: member.user.last_name,
      memberLanguage: member.user.language_code,
      memberIsBot: member.user.is_bot,
      memberTitle: member.custom_title,
      status: member.status,
      oldStatus: change.old_chat_member.status,
      isMember: inChat(member),
      wasMember: inChat(change.old_chat_member),
      until: at(member.until_date),
      inviteLink: change.invite_link?.invite_link,
      inviteLinkName: change.invite_link?.name,
      viaJoinRequest: change.via_join_request,
      ...chatOf(change.chat),
      ...fromOf(change.from),
    };
  });

const FLATTENERS = new Map<string, z.ZodType<Record<string, unknown>>>([
  ['message', MessageUpdate],
  ['edited_message', MessageUpdate],
  ['channel_post', MessageUpdate],
  ['edited_channel_post', MessageUpdate],
  ['callback_query', ButtonPress],
  ['inline_query', InlineQuery],
  ['poll_answer', PollAnswer],
  ['chat_join_request', JoinRequest],
  ['my_chat_member', MemberChange],
  ['chat_member', MemberChange],
]);

const Update = z.looseObject({ update_id: z.number().int() });

export const updateEvent = (body: unknown) => {
  const update = Update.safeParse(body);

  if (!update.success) return null;

  const kind = Object.keys(update.data).find((key) => key !== 'update_id');

  if (!kind) return null;

  const flat = FLATTENERS.get(kind)?.safeParse(update.data[kind]);

  return {
    id: String(update.data.update_id),
    type: kind,
    payload: {
      ...(flat?.success ? flat.data : {}),
      updateId: update.data.update_id,
      update: update.data,
    },
  };
};
