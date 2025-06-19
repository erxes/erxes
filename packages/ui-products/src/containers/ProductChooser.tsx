import { gql, useQuery } from "@apollo/client";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import Chooser from "@erxes/ui/src/components/Chooser";
import { isEnabled } from "@erxes/ui/src/utils/core";
import queryString from "query-string";
import React, { useEffect, useState, useRef, useCallback } from "react";
import ProductCategoryChooser from "../components/ProductCategoryChooser";
import { queries as productQueries } from "../graphql";
import {
  IProduct,
  ProductCategoriesQueryResponse,
  ProductsQueryResponse
} from "../types";
import ProductForm from "./ProductForm";

type Props = {
  data: { name: string; products: IProduct[] };
  categoryId?: string;
  vendorId?: string;
  closeModal: () => void;
  onSelect: (products: IProduct[]) => void;
  loadDiscountPercent?: (productsData: any) => void;
  limit?: number;
  ids?: string[];
};

const ProductChooser: React.FC<Props> = ({
  data,
  categoryId: propCategoryId,
  vendorId: propVendorId,
  closeModal,
  onSelect,
  loadDiscountPercent,
  limit,
  ids
}) => {
  const [perPage, setPerPage] = useState(20);
  const [loadedProducts, setLoadedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const savedFilters = JSON.parse(
    localStorage.getItem("erxes_products:chooser_filter") || "{}"
  );

  const [categoryId, setCategoryId] = useState<string | undefined>(
    propCategoryId || savedFilters?.categoryId
  );
  const [vendorId, setVendorId] = useState<string | undefined>(
    propVendorId || savedFilters?.vendorId
  );
  const [searchValue, setSearchValue] = useState<string | undefined>("");

  const parsedQuery = queryString.parse(location.search);

  const { data: productsData, refetch: refetchProducts, loading: queryLoading } =
    useQuery<ProductsQueryResponse>(gql(productQueries.products), {
      variables: {
        perPage,
        searchValue,
        categoryId,
        vendorId,
        pipelineId: parsedQuery.pipelineId,
        boardId: parsedQuery.boardId,
        ids: ids
      },
      fetchPolicy: "network-only"
    });

  const { data: categoriesData } = useQuery<ProductCategoriesQueryResponse>(
    gql(productQueries.productCategories)
  );

  const saveFilter = useCallback(() => {
    localStorage.setItem(
      "erxes_products:chooser_filter",
      JSON.stringify({ categoryId, vendorId })
    );
  }, [categoryId, vendorId]);

  useEffect(() => {
    if (productsData?.products) {
      setLoadedProducts(prev => {
        // Filter out duplicates
        const newProducts = productsData.products.filter(
          newProd => !prev.some(p => p._id === newProd._id)
        );
        return [...prev, ...newProducts];
      });
    }
  }, [productsData]);

  useEffect(() => {
    // Reset when filters change
    setLoadedProducts([]);
    setPerPage(20);
    refetchProducts();
    saveFilter();
  }, [categoryId, vendorId, searchValue, refetchProducts, saveFilter]);

  const handleSearch = (value: string, reload?: boolean) => {
    setSearchValue(value);
  };

  const loadMore = useCallback(async () => {
    if (loading || !listRef.current) return;
    
    setLoading(true);
    // Save current scroll measurements
    const scrollTop = listRef.current.scrollTop;
    const scrollHeight = listRef.current.scrollHeight;
    const clientHeight = listRef.current.clientHeight;
    
    try {
      await refetchProducts({
        variables: {
          perPage: perPage + 20,
          searchValue,
          categoryId,
          vendorId,
          pipelineId: parsedQuery.pipelineId,
          boardId: parsedQuery.boardId,
        }
      });
      
      setPerPage(prev => prev + 20);
      
      // Use requestAnimationFrame for smooth scroll restoration
      requestAnimationFrame(() => {
        if (!listRef.current) return;
        
        // Calculate how much the content grew
        const newScrollHeight = listRef.current.scrollHeight;
        const heightDiff = newScrollHeight - scrollHeight;
        
        // Restore scroll position relative to the bottom
        listRef.current.scrollTop = scrollTop + heightDiff;
      });
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, perPage, searchValue, categoryId, vendorId, parsedQuery, refetchProducts]);

  const renderProductCategoryChooser = () => (
    <>
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={vendorId}
        onSelect={companyId => setVendorId(companyId as string)}
        customOption={{ label: "Choose company", value: "" }}
      />
      <ProductCategoryChooser
        currentId={categoryId}
        categories={categoriesData?.productCategories || []}
        onChangeCategory={categoryId => setCategoryId(categoryId)}
        customOption={{ label: "Choose product category...", value: "" }}
      />
    </>
  );

  const renderDiscount = (data: any) => {
    if (isEnabled("loyalties") && loadDiscountPercent && data) {
      loadDiscountPercent({
        product: { _id: data._id },
        quantity: 1
      });
    }
  };

  const renderName = (product: IProduct) => {
    if (product.code && product.subUoms?.length) {
      return `${product.code} - ${product.name} ~${
        Math.round((1 / (product.subUoms[0].ratio || 1)) * 100) / 100
      } - ${product.unitPrice}`;
    }
    if (product.code) {
      return `${product.code} - ${product.name} - ${product.unitPrice.toLocaleString() || ""}`;
    }
    return product.name;
  };

  return (
    <div ref={listRef} style={{ overflowY: 'auto', height: '100%' }}>
      <Chooser
        data={{ name: data.name, datas: data.products }}
        title="Product"
        perPage={perPage}
        datas={loadedProducts}
        search={handleSearch}
        clearState={() => handleSearch("", true)}
        onSelect={onSelect}
        renderName={renderName}
        renderForm={({ closeModal }) => <ProductForm closeModal={closeModal} />}
        renderFilter={renderProductCategoryChooser}
        handleExtra={renderDiscount}
        modalSize="xl"
        closeModal={closeModal}
        limit={limit}
        onLoadMore={loadMore}
        loading={queryLoading || loading}
      />
    </div>
  );
};

export default ProductChooser;