import { useLocation } from 'react-router';
import { AddProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/components/ProductRulesOnTax';
import { AddProductGroup } from '@/ebarimt/settings/product-group/components/ProductGroup';

export const EBarimtTopbar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/mongolian/ebarimt/product-rules-on-tax') {
    return (
      <div className="flex items-center gap-3">
        <AddProductRulesOnTax />
      </div>
    );
  }
  if (pathname === '/settings/mongolian/ebarimt/product-groups') {
    return (
      <div className="flex items-center gap-3">
        <AddProductGroup />
      </div>
    );
  }
  return null;
};
