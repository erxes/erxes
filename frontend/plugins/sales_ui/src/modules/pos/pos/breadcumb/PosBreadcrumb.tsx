import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { Link, useLocation, useParams } from 'react-router-dom';
import { IconBuilding } from '@tabler/icons-react';
import { useGetCurrentUsersPos } from '@/pos/hooks/useGetCurrentUsersPos';
import { FavoriteToggleIconButton, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const PosBreadcrumb = () => {
  const { posId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation('sales');

  const { pos, loading } = useGetCurrentUsersPos();

  const posItem = pos?.find((pos) => pos._id === posId);
  const childName = getPosChildName(pathname, t);
  const favoriteBreadcrumb = createFavoriteBreadcrumb(posItem?.name, childName);

  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }

  return (
    <>
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to={`/sales/pos/${posItem?._id}/orders`}>
            <IconBuilding size={16} />
            {posItem?.name}
          </Link>
        </Button>
      </Breadcrumb.Item>
      <Breadcrumb.Item className="ml-1">
        <FavoriteToggleIconButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconCashRegister"
        />
      </Breadcrumb.Item>
    </>
  );
};

const getPosChildName = (pathname: string, t: (key: string) => string) => {
  if (pathname.includes('/orders-by-customer')) {
    return t('pos-orders-by-customer');
  }

  if (pathname.includes('/orders-by-subscription')) {
    return t('pos-orders-by-subscription');
  }

  if (pathname.includes('/by-items')) {
    return t('pos-by-items');
  }

  if (pathname.includes('/items')) {
    return t('pos-items');
  }

  if (pathname.includes('/summary')) {
    return t('pos-summary');
  }

  if (pathname.includes('/covers')) {
    return t('pos-covers');
  }

  if (pathname.includes('/orders')) {
    return t('pos-orders');
  }
};
