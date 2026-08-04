import { Combobox, Tooltip, isUndefinedOrNull } from 'erxes-ui';
import {
  ProductsInlineContext,
  useProductsInlineContext,
} from '../contexts/ProductsInlineContext';
import { IProduct } from '../types/Product';
import { useEffect, useMemo, useState } from 'react';
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
  const [productsList, setProductsList] = useState<IProduct[]>(products || []);

  const missingProductIds = useMemo(() => {
    if (!productIds?.length) {
      return [];
    }

    return productIds.filter((id) => !products?.some((p) => p._id === id));
  }, [productIds, products]);

  return (
    <ProductsInlineContext.Provider
      value={{
        products: products || productsList,
        loading: false,
        productIds: productIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Products'
          : placeholder,
        updateProducts: updateProducts || setProductsList,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {missingProductIds.length > 0 && (
        <ProductsInlineEffectComponent missingProductIds={missingProductIds} />
      )}
    </ProductsInlineContext.Provider>
  );
};

const ProductsInlineEffectComponent = ({
  missingProductIds,
}: {
  missingProductIds: string[];
}) => {
  const { updateProducts, products } = useProductsInlineContext();
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
  const { products, loading, placeholder } = useProductsInlineContext();

  const getDisplayValue = (): string | JSX.Element | undefined => {
    if (!products || products.length === 0) {
      return undefined;
    }

    const product = products[0];
    const name =
      products.length === 1
        ? product.name
        : `${product.name} +${products.length - 1} more`;

    if (!product.code) return name;

    return (
      <span className="flex gap-1.5 items-center min-w-0">
        <span className="font-mono text-xs bg-muted border rounded px-1 text-muted-foreground shrink-0">
          {product.code}
        </span>
        <span className="truncate">{name}</span>
      </span>
    );
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
