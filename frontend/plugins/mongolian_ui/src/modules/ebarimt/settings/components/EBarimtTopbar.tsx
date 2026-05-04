import { useLocation } from 'react-router';
import { AddProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/components/ProductRulesOnTax';
import { AddProductGroup } from '@/ebarimt/settings/product-group/components/ProductGroup';
import { AddPosInEBarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/components/AddPosInEBarimtConfig';
import { AddReturnEBarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/AddReturnEBarimtConfig';
import { AddStageInEBarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/components/AddStageInEBarimtConfig';

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
  if (pathname === '/settings/mongolian/ebarimt/stage-in') {
    return (
      <div className="flex items-center gap-3">
        <AddStageInEBarimtConfig />
      </div>
    );
  }
  if (pathname === '/settings/mongolian/ebarimt/pos-in') {
    return (
      <div className="flex items-center gap-3">
        <AddPosInEBarimtConfig />
      </div>
    );
  }
  if (pathname === '/settings/mongolian/ebarimt/stage-return') {
    return (
      <div className="flex items-center gap-3">
        <AddReturnEBarimtConfig />
      </div>
    );
  }
  return null;
};
