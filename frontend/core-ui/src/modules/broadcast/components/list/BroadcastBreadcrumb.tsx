import { IconBroadcast } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const BroadcastBreadcrumb = () => {
  const { t } = useTranslation('broadcasts');
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to="/broadcasts">
                <IconBroadcast />
                {t('broadcast')}
              </Link>
            </Button>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </>
  );
};
