import { IconBroadcast } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

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
                {t('broadcast', 'Broadcast')}
              </Link>
            </Button>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </>
  );
};
