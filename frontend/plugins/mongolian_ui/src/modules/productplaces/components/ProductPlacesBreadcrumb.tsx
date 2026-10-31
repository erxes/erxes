import { IconMapPin } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PRODUCT_PLACES_SETTINGS_ROUTES } from '@/productplaces/constants/settingRoutes';

export const ProductPlacesBreadcrumb = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('mongolian');
  const label =
    PRODUCT_PLACES_SETTINGS_ROUTES[
      pathname as keyof typeof PRODUCT_PLACES_SETTINGS_ROUTES
    ];

  return (
    <>
      <Button variant="ghost">
        <IconMapPin />
        {t('product-place')}
      </Button>
      {label && (
        <>
          <Separator.Inline />
          <Button variant="ghost" className="hover:bg-transparent">
            {t(label)}
          </Button>
        </>
      )}
    </>
  );
};
