import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconForms } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const FormsBreadCrumb = () => {
  const { t } = useTranslation('frontline');
  return (
    <Button variant="ghost" className="font-semibold" asChild>
      <Link to={`/frontline/forms`}>
        <IconForms />
        {t('forms')}
      </Link>
    </Button>
  );
};
