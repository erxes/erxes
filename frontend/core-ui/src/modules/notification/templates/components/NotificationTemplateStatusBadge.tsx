import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TNotificationTemplate } from '../types';
import { getTemplateStatus } from '../utils/templateStatus';

const VARIANTS = {
  default: 'secondary',
  draft: 'warning',
  custom: 'success',
  'unpublished-changes': 'info',
} as const;

export const NotificationTemplateStatusBadge = ({
  template,
}: {
  template: TNotificationTemplate;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const status = getTemplateStatus(template);

  return (
    <Badge variant={VARIANTS[status]}>
      {t(`template-status-${status}`, { version: template.version })}
    </Badge>
  );
};
