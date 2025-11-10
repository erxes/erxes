import { useLocation } from 'react-router';
import { AddProductRulesOnTax } from '../product-rules-on-tax/components/ProductRulesOnTax';
import { AddProductGroups } from '../product-groups/components/ProductGroups';

export const EBarimtTopbar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/ebarimt/product-rules-on-tax') {
    return (
      <div className="flex items-center gap-3">
        <AddProductRulesOnTax />
      </div>
    );
  }
  if (pathname === '/settings/ebarimt/product-groups') {
    return (
      <div className="flex items-center gap-3">
        <AddProductGroups />
      </div>
    );
  }
  return null;
};
