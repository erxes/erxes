import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { CreateBrand } from './CreateBrand';
import { Breadcrumb, Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconChessKnightFilled, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { renderingBrandDetailAtom } from '../state';

export function BrandsHeader() {
  const { t } = useTranslation('settings', {
    keyPrefix: 'brands',
  });
  const [isAddingBrand, setIsAddingBrand] = useAtom(renderingBrandDetailAtom);

  useScopedHotkeys(
    'c',
    () => {
      setIsAddingBrand(true);
    },
    SettingsHotKeyScope.BrandsPage,
  );

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/brands">
                  <IconChessKnightFilled />
                  {t('_')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="brandsCreate">
          {/* <CreateBrand /> */}
          <Button
            disabled={isAddingBrand}
            onClick={() => setIsAddingBrand(true)}
          >
            <IconPlus />
            {t('create-brand')}
            <Kbd>C</Kbd>
          </Button>
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
}
