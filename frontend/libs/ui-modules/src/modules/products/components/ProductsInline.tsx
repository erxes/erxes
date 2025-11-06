import {
  AvatarProps,
  Combobox,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import {
  ProductsInlineContext,
  useProductsInlineContext,
} from '../contexts/ProductsInlineContext';
import { IProduct } from '../types/Product';
import { useEffect, useState } from 'react';
import { useProductsInline } from '../hooks/useProducts';

export const ProductsInlineProvider = ({
  children,
  productIds,
  products,
  placeholder,
  updateProducts,
}: {
  children?: React.ReactNode;
  productIds?: string[];
  products?: IProduct[];
  placeholder?: string;
  updateProducts?: (products: IProduct[]) => void;
}) => {
  const [_products, _setProducts] = useState<IProduct[]>(products || []);

  return (
    <ProductsInlineContext.Provider
      value={{
        products: products || _products,
        loading: false,
        productIds: productIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Products'
          : placeholder,
        updateProducts: updateProducts || _setProducts,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {productIds?.some(
        (id) => !products?.some((product) => product._id === id),
      ) && (
          <ProductsInlineEffectComponent
            missingProductIds={productIds.filter(
              (id) => !products?.some((product) => product._id === id),
            )}
          />
        )}
    </ProductsInlineContext.Provider>
  );
};

const ProductsInlineEffectComponent = ({
  missingProductIds,
}: {
  missingProductIds: string[];
}) => {
  const { updateProducts, products, productIds } = useProductsInlineContext();
  const { products: missingProducts } = useProductsInline({
    variables: {
      ids: missingProductIds,
    },
  });

  useEffect(() => {
    if (missingProducts && missingProducts.length > 0) {
      const existingProductsMap = new Map(
        products.map((product) => [product._id, product]),
      );
      const newProducts = missingProducts.filter(
        (product) => !existingProductsMap.has(product._id),
      );

      if (newProducts.length > 0) {
        updateProducts?.([...products, ...newProducts]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingProducts, missingProductIds]);

  return null;
};

export const ProductsInlineTitle = ({ className }: { className?: string }) => {
  const { products, loading, placeholder } =
    useProductsInlineContext();

  const getDisplayValue = () => {
    if (!products || products.length === 0) {
      return undefined;
    }

    const product = products[0];

    if (products.length === 1) {
      return `${product.code} - ${product.name}`;
    }

    return ` ${product.code}...${products.length - 1} products`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
      className={className}
    />
  );
};

export const ProductsInlineRoot = ({
  productIds,
  products,
  placeholder,
  updateProducts,
  className,
}: {
  products?: IProduct[];
  productIds?: string[];
  placeholder?: string;
  updateProducts?: (products: IProduct[]) => void;
  className?: string;
}) => {
  return (
    <ProductsInlineProvider
      productIds={productIds}
      products={products}
      placeholder={placeholder}
      updateProducts={updateProducts}
    >
      <ProductsInlineTitle className={className} />
    </ProductsInlineProvider>
  );
};

export const ProductsInline = Object.assign(ProductsInlineRoot, {
  Provider: ProductsInlineProvider,
  Title: ProductsInlineTitle,
});
