import type { Translate } from '@/modules/i18n/translate';
import type { KnowledgeBaseName } from '../utils/label';

export const kbOffTitle = (name: KnowledgeBaseName, t: Translate): string =>
  t('kb.offTitle', { name: name.title });

export const kbOffReason = (name: KnowledgeBaseName, t: Translate): string =>
  t('kb.offReason', { name: name.title });
