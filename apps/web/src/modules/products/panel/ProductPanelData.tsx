import type { DataExtensionValues, ProductWithValues } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { RecordFields } from '~/modules/dataExtensions/values/RecordFields';
import { useCanManageProducts, useStoreProduct } from '../useProducts';

/** The organisation's own product fields (brand, warranty), under their groups in the Detail tab. */
export const ProductPanelData = ({ product }: { product: ProductWithValues }) => {
  const manage = useCanManageProducts();
  const store = useStoreProduct();

  return (
    <RecordFields
      recordType="core.product"
      values={product.values}
      readOnly={!manage}
      save={async (values: DataExtensionValues) =>
        store(await orpc.products.update.call({ id: product.id, values }))
      }
    />
  );
};
