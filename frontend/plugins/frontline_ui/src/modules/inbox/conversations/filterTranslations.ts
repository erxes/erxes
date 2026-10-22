import { useTranslation } from 'react-i18next';

const en = {
  createdAt: 'Created at',
  resolvedAt: 'Resolved at',
};

const mn: Record<keyof typeof en, string> = {
  createdAt: 'Үүссэн огноо',
  resolvedAt: 'Шийдвэрлэсэн огноо',
};

export const useConversationDateFilterTranslation = (): {
  t: (key: keyof typeof en) => string;
} => {
  const { i18n } = useTranslation('frontline');

  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-inbox-dates')) {
      i18n.addResourceBundle(language, 'frontline-inbox-dates', resources);
    }
  }

  return {
    t: (key) =>
      i18n.t(key, { ns: 'frontline-inbox-dates', defaultValue: en[key] }),
  };
};
