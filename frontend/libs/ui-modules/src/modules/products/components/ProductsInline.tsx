import {
  ProductsInlineContext,
  useProductsInlineContext,
} from '../contexts/ProductsInlineContext';
import { Combobox, isUndefinedOrNull, Tooltip } from 'erxes-ui';
import { IProduct } from '../types/Product';
import { useEffect } from 'react';
import { useProductsInline } from '../hooks/useProducts';

interface ProductsInlineProviderProps {
  children: React.ReactNode;
  productIds?: string[];
  products?: IProduct[];
  placeholder?: string;
  updateProducts?: (products: IProduct[]) => void;
}

const ProductsInlineProvider = ({
  children,
  placeholder,
  productIds,
  products,
  updateProducts,
}: ProductsInlineProviderProps) => {
  return (
    <ProductsInlineContext.Provider
      value={{
        products: products || [],
        // Todo: Add dynamic loading state
        loading: false,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Products'
          : placeholder,
        updateProducts,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {productIds?.some(
        (id) => !products?.some((product) => product._id === id),
      ) && (
        <ProductsInlineEffectComponent
          productIdsWithNoDetails={productIds.filter(
            (id) => !products?.some((product) => product._id === id),
          )}
        />
      )}
    </ProductsInlineContext.Provider>
  );
};

const ProductsInlineEffectComponent = ({
  productIdsWithNoDetails,
}: {
  productIdsWithNoDetails: string[];
}) => {
  const { updateProducts, products } = useProductsInlineContext();
  const { products: detailMissingProducts } = useProductsInline({
    variables: {
      ids: productIdsWithNoDetails,
    },
  });

  useEffect(() => {
    if (detailMissingProducts && detailMissingProducts.length > 0) {
      const existingProductsMap = new Map(
        products.map((product) => [product._id, product]),
      );
      const newProducts = detailMissingProducts.filter(
        (product) => !existingProductsMap.has(product._id),
      );

      if (newProducts.length > 0) {
        updateProducts?.([...products, ...newProducts]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailMissingProducts, updateProducts, productIdsWithNoDetails]);

  return null;
};

const ProductsInlineTitle = () => {
  const { products, loading, placeholder } = useProductsInlineContext();

  const getDisplayValue = () => {
    if (products.length === 0) return undefined;

    if (products.length === 1) {
      if (!products[0].name) {
        return;
      }
      return products[0].name;
    }

    return `${products.length} products selected`;
  };

  return (
    <span className="flex items-center gap-2">
      {products.length === 1 && (
        <span className="text-muted-foreground">{products[0].code}</span>
      )}
      <Combobox.Value
        value={getDisplayValue()}
        loading={loading}
        placeholder={placeholder}
      />
    </span>
  );
};

const ProductsInlineRoot = ({
  productIds,
  products,
  placeholder,
  updateProducts,
}: Omit<ProductsInlineProviderProps, 'children'>) => {
  return (
    <ProductsInlineProvider
      productIds={productIds}
      products={products}
      placeholder={placeholder}
      updateProducts={updateProducts}
    >
      <ProductsInline.Title />
    </ProductsInlineProvider>
  );
};

export const ProductsInline = Object.assign(ProductsInlineRoot, {
  Provider: ProductsInlineProvider,
  Title: ProductsInlineTitle,
});
