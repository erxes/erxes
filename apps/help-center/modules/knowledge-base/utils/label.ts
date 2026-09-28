import type { Translate } from '@/modules/i18n/translate';

export type KnowledgeBaseName = {
  title: string;
  inline: string;
};

export const knowledgeBaseName = (
  label: string,
  t: Translate,
): KnowledgeBaseName => {
  const custom = label.trim();

  return custom
    ? { title: custom, inline: custom }
    : { title: t('kb.title'), inline: t('kb.inline') };
};
