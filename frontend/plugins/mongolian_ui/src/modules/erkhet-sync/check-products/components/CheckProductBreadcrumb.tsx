import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useCheckProductLeadSessionKey } from '../hooks/useCheckProductLeadSessionKey';

export const CheckProductBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = useCheckProductLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet-history"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet-history">Sync History</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/check-synced-deals"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/check-synced-deals">Check Deals</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/check-pos-orders"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/check-pos-orders">Check Orders</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/check-category"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/check-category">Check Category</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/check-products"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/check-products">Check Products</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
