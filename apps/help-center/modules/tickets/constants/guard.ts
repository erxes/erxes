import type { Translate } from '@/modules/i18n/translate';
import type { KnowledgeBaseName } from '@/modules/knowledge-base/utils/label';

export const NEW_TICKET_ROUTE = '/tickets/new';

export const ticketsOffReason = (
  knowledgeBase: KnowledgeBaseName,
  t: Translate,
): string => t('tickets.offReason', { kb: knowledgeBase.inline });
