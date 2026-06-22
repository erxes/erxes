import { IconCashRegister, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePosList } from '@/pos/hooks/usePosList';

export const PosIndexPage = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const { posList, loading } = usePosList();

  useEffect(() => {
    if (!loading && posList && posList.length > 0) {
      const firstPos = posList[0];
      navigate(`/sales/pos/${firstPos._id}/orders`);
    }
  }, [loading, posList, navigate]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/sales/pos">
                    <IconCashRegister />
                    {t('pos')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/sales/pos">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>
    </div>
  );
};
