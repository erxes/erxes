import { useTranslation } from 'react-i18next';

const en = {
  conversationIdle: 'Conversation idle',
  lastPublicMessage: 'Last public message',
  conversationCreated: 'Conversation created',
  idleDescription: 'No public messages for at least 5 minutes',
};
const mn: Record<keyof typeof en, string> = {
  conversationIdle: 'Conversation идэвхгүй',
  lastPublicMessage: 'Сүүлийн public message',
  conversationCreated: 'Conversation үүссэн',
  idleDescription: '5 минутаас дээш хугацаанд public message ирээгүй',
};

export const useConversationIdleTranslation = (): {
  t: (key: keyof typeof en) => string;
} => {
  const { i18n } = useTranslation('frontline');
  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-idle'))
      i18n.addResourceBundle(language, 'frontline-idle', resources);
  }
  return {
    t: (key) => i18n.t(key, { ns: 'frontline-idle', defaultValue: en[key] }),
  };
};
