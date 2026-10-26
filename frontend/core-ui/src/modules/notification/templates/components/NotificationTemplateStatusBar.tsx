import { IconAlertTriangle, IconArrowBackUp } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TNotificationTemplate } from '../types';
import { getTemplateStatus, hasRecentFallback } from '../utils/templateStatus';

/** What recipients get right now, so a draft is never mistaken for live. */
export const NotificationTemplateStatusBar = ({
  template,
  conflict,
  onReload,
  onRevert,
}: {
  template: TNotificationTemplate;
  conflict: boolean;
  onReload: () => void;
  onRevert: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const status = getTemplateStatus(template);

  if (conflict) {
    return (
      <div className="flex items-center gap-3 bg-warning/10 px-4 py-2 border-b text-sm">
        <IconAlertTriangle size={16} className="text-warning" />
        <span className="flex-1">{t('template-conflict')}</span>
        <Button size="sm" variant="outline" onClick={onReload}>
          {t('reload')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-background px-4 py-2 border-b text-xs">
      <span className="flex-1 text-muted-foreground">
        {status === 'default' || status === 'draft'
          ? t('template-live-default')
          : t('template-live-custom', { version: template.version })}
        {status === 'draft' && ` · ${t('template-draft-not-live')}`}
        {status === 'unpublished-changes' &&
          ` · ${t('template-unpublished-changes')}`}
      </span>
      {hasRecentFallback(template) && (
        <span className="flex items-center gap-1 text-warning">
          <IconAlertTriangle size={14} />
          {t('template-fell-back', { count: template.fallbackCount })}:{' '}
          {template.lastFallbackReason}
        </span>
      )}
      {template.published && (
        <Button size="sm" variant="ghost" onClick={onRevert}>
          <IconArrowBackUp />
          {t('revert-to-default')}
        </Button>
      )}
    </div>
  );
};
