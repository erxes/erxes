import { useTemplatePriorInstallsAlert } from '@/template/hooks/useTemplatePriorInstallsAlert';
import { IconCopy } from '@tabler/icons-react';
import { Alert } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

/** Warns that this template is already installed and would be duplicated. */
export const TemplatePriorInstallsAlert = () => {
  const { t } = useTranslation('templates');
  const alert = useTemplatePriorInstallsAlert();

  if (!alert) {
    return null;
  }

  return (
    <Alert variant="warning">
      <IconCopy />
      <Alert.Title>{t('already-installed', alert.titleValues)}</Alert.Title>
      <Alert.Description>
        <p>{t(alert.bodyKey, alert.bodyValues)}</p>
        <Link
          to={alert.latestHref}
          className="font-medium underline underline-offset-2"
        >
          {t('view-latest-installation')}
        </Link>
      </Alert.Description>
    </Alert>
  );
};
