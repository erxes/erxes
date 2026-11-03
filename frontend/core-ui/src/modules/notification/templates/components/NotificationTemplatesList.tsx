import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react';
import { RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useNotificationTemplates } from '../hooks/useNotificationTemplates';
import { TNotificationTemplate } from '../types';
import { hasRecentFallback } from '../utils/templateStatus';
import { NotificationTemplateStatusBadge } from './NotificationTemplateStatusBadge';

export const NOTIFICATION_TEMPLATES_PATH = '/settings/notification/templates';

const NotificationTemplateRow = ({
  template,
}: {
  template: TNotificationTemplate;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const lastSaved = template.draft || template.published;
  const savedBy =
    lastSaved?.savedUser?.details?.fullName || lastSaved?.savedUser?.email;

  return (
    <Link
      to={`${NOTIFICATION_TEMPLATES_PATH}/${encodeURIComponent(template.key)}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{template.title}</p>
        <p className="text-muted-foreground text-xs truncate">
          {template.description}
        </p>
        {lastSaved?.savedAt && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t('template-saved-by', { name: savedBy || t('someone') })}{' '}
            <RelativeDateDisplay.Value value={lastSaved.savedAt} />
          </p>
        )}
        {hasRecentFallback(template) && (
          <p className="flex items-center gap-1 mt-1 text-[11px] text-warning">
            <IconAlertTriangle size={12} />
            {t('template-fell-back', { count: template.fallbackCount })}
          </p>
        )}
      </div>
      <NotificationTemplateStatusBadge template={template} />
      <IconChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
};

export const NotificationTemplatesList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { templates, loading, error } = useNotificationTemplates();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-4">
        <p className="font-semibold text-sm tracking-tight">
          {t('email-templates')}
        </p>
        <p className="text-muted-foreground text-xs">
          {t('email-templates-description')}
        </p>
      </div>

      {error ? (
        <div className="p-4 border border-destructive/30 rounded-xl text-destructive text-sm">
          {error.message}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y overflow-hidden">
          {templates.map((template) => (
            <NotificationTemplateRow key={template.key} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};
