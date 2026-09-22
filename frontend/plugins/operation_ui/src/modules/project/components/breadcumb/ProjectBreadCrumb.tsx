import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

import { IconClipboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const ProjectBreadCrumb = ({ link }: { link: string }) => {
  const { t } = useTranslation('operation');
  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconClipboard />
          {t('projects')}
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
