import { ProductsInline } from 'ui-modules/modules/products';
import { GenericCommandList } from './GenericCommandList';
import { useProducts } from 'ui-modules/modules/products/hooks/useProducts';

export const ProducsCommandList = ({
  searchValue,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { products, loading, handleFetchMore, totalCount, error } = useProducts(
    {
      variables: {
        searchValue,
      },
    },
  );
  return (
    <GenericCommandList
      heading="Products"
      items={products}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      onSelect={onSelect}
      getKey={(product) => product._id}
      renderItem={(product) => (
        <ProductsInline products={[product]} placeholder="Unnamed product" />
      )}
      selectField={selectField}
    />
  );
};
