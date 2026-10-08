import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export const CreateEmailTemplate = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-templates' });
  const navigate = useNavigate();

  useScopedHotkeys(
    `c`,
    () => navigate(EmailTemplatePath.Create),
    SettingsHotKeyScope.EmailTemplatesPage,
  );

  return (
    <Button asChild>
      <Link to={EmailTemplatePath.Create}>
        <IconPlus />
        {t('create-template')}
        <Kbd>C</Kbd>
      </Link>
    </Button>
  );
};
