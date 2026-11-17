import { IconCashRegister } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import PosDelete from '~/modules/pos/components/pos-delete/PosDelete';
import { PosEdit } from '~/modules/pos/components/pos-edit';

export const PosEditPage = () => {
  const { t } = useTranslation('sales');
  const { id } = useParams<{ id: string }>();

  return (
    <PosEdit
      id={id}
      actions={<PosDelete posId={id} />}
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.List className="gap-2">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/sales/settings/pos">
                  <IconCashRegister />
                  {t('pos')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      }
    />
  );
};
