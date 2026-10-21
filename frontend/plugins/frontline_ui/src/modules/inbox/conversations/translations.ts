import { useTranslation } from 'react-i18next';

const en = {
  noMessages: 'No messages yet',
  photo: 'Photo',
  video: 'Video',
  audio: 'Audio',
  sticker: 'Sticker',
  unsupported: 'Unsupported message',
  deleted: 'Message deleted',
  poll: 'Poll',
  survey: 'Survey',
  voice: 'Voice message',
  attachment: 'Attachment',
  attachments: '{{count}} attachments',
  share: 'Shared post',
  storyMention: 'Story mention',
  storyReply: 'Story reply',
  forwarded: 'Forwarded message',
  sharedContent: 'Shared content',
};
const mn: Record<keyof typeof en, string> = {
  noMessages: 'Зурвас хараахан алга',
  photo: 'Зураг',
  video: 'Видео',
  audio: 'Аудио',
  sticker: 'Стикер',
  unsupported: 'Дэмжигдээгүй зурвас',
  deleted: 'Зурвас устсан',
  poll: 'Санал асуулга',
  survey: 'Судалгаа',
  voice: 'Дуут зурвас',
  attachment: 'Хавсралт',
  attachments: '{{count}} хавсралт',
  share: 'Хуваалцсан нийтлэл',
  storyMention: 'Story-д дурдсан',
  storyReply: 'Story-д хариулсан',
  forwarded: 'Дамжуулсан зурвас',
  sharedContent: 'Хуваалцсан агуулга',
};
export type ConversationPreviewLabel = keyof typeof en;

export const useConversationPreviewTranslation = (): {
  t: (key: ConversationPreviewLabel, count?: number) => string;
} => {
  const { i18n } = useTranslation('frontline');
  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-preview'))
      i18n.addResourceBundle(language, 'frontline-preview', resources);
  }
  return {
    t: (key, count) =>
      i18n.t(key, { ns: 'frontline-preview', defaultValue: en[key], count }),
  };
};
