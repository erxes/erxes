import { TNotificationTemplate } from '../types';

export type TNotificationTemplateStatus =
  | 'default'
  | 'draft'
  | 'custom'
  | 'unpublished-changes';

/** What recipients get now, and whether a saved edit is still waiting. */
export const getTemplateStatus = ({
  draft,
  published,
  draftRevision,
  publishedRevision,
}: TNotificationTemplate): TNotificationTemplateStatus => {
  if (!published) {
    return draft ? 'draft' : 'default';
  }

  return publishedRevision === draftRevision ? 'custom' : 'unpublished-changes';
};

const FALLBACK_WINDOW = 7 * 24 * 60 * 60 * 1000;

export const hasRecentFallback = ({ lastFallbackAt }: TNotificationTemplate) =>
  !!lastFallbackAt &&
  Date.now() - new Date(lastFallbackAt).getTime() < FALLBACK_WINDOW;
