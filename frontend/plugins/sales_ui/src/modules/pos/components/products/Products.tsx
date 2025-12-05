import { InfoCard } from 'erxes-ui';
import { ProductGroupsList } from './ProductGroupsList';
import { InitialProductCategories } from './InitialProductCategories';
import { KioskExcludeProducts } from './KioskExcludeProducts';
import { ProductAndCategoryMapping } from './ProductAndCategoryMapping';
import { RemainderConfigs } from './RemainderConfigs';
import { isFieldVisible } from '../../constants';

interface ProductsProps {
  posId?: string;
  posType?: string;
}

const Products: React.FC<ProductsProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('productGroups', posType) && (
        <InfoCard title="Product Groups">
          <InfoCard.Content>
            <ProductGroupsList posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('initialProductCategories', posType) && (
        <InfoCard title="Initial product categories">
          <InfoCard.Content>
            <InitialProductCategories posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('kioskExcludeProducts', posType) && (
        <InfoCard title="Kiosk exclude products">
          <InfoCard.Content>
            <KioskExcludeProducts posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('productCategoryMapping', posType) && (
        <InfoCard title="Product & category mapping">
          <InfoCard.Content>
            <ProductAndCategoryMapping posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('remainderConfigs', posType) && (
        <InfoCard title="Remainder configs">
          <InfoCard.Content>
            <RemainderConfigs posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default Products;
