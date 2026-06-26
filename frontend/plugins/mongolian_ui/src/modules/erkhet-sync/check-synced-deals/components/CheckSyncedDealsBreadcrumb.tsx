import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCheckSyncedDealsLeadSessionKey } from '../hooks/useCheckSyncedDealsLeadSessionKey';

export const CheckSyncedDealsBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = useCheckSyncedDealsLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const { t } = useTranslation('mongolian');
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/history"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/history">{t('sync-history')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/deals"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/deals">{t('check-deals')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/pos-order"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/pos-order">{t('check-orders')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/category"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/category">{t('check-category')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/products"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/products">{t('check-products')}</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
