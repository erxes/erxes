import { Breadcrumb, Button } from 'erxes-ui';
import { IconRestore } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CyclesBreadcrumb = ({ link }: { link: string }) => {
  const { t } = useTranslation('operation');
  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconRestore />
          {t('cycles')}
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
