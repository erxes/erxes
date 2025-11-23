import { ProductRulesOnTaxTable } from '@/ebarimt/settings/product-rules-on-tax/components/ProductRulesOnTaxTable';
import { EditProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/components/EditProductRulesOnTax';

export const ProductRulesOnTaxPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <ProductRulesOnTaxTable />
      </div>
      <EditProductRulesOnTax />
    </div>
  );
};
