import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useCheckCategoryLeadSessionKey } from '../hooks/useCheckCategoryLeadSessionKey';

export const CheckCategoryBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = useCheckCategoryLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/history"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/history">Sync History</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/deals"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/deals">Check Deals</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/pos-order"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/pos-order">Check Orders</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/category"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/category">Check Category</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/sync-erkhet/products"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/sync-erkhet/products">Check Products</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
