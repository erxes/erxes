import { gql, useQuery } from "@apollo/client";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import Chooser from "@erxes/ui/src/components/Chooser";
import { isEnabled } from "@erxes/ui/src/utils/core";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import ProductCategoryChooser from "../components/ProductCategoryChooser";
import { queries as productQueries, } from "../graphql";
import {
  IProduct,
  ProductCategoriesQueryResponse,
  ProductsQueryResponse,
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
};

const ProductChooser: React.FC<Props> = ({
  data,
  categoryId: propCategoryId,
  vendorId: propVendorId,
  closeModal,
  onSelect,
  loadDiscountPercent,
  limit
}) => {
  const [perPage, setPerPage] = useState(20);
  const savedFilters = JSON.parse(
    localStorage.getItem("erxes_products:chooser_filter") || "{}"
  );

  const [categoryId, setCategoryId] = useState<string | undefined>(
    propCategoryId || savedFilters?.categoryId
  );
  const [vendorId, setVendorId] = useState<string | undefined>(propVendorId || savedFilters?.vendorId);
  const [searchValue, setSearchValue] = useState<string | undefined>('');

  const parsedQuery = queryString.parse(location.search);

  const { data: productsData, refetch: refetchProducts } =
    useQuery<ProductsQueryResponse>(gql(productQueries.products), {
      variables: {
        perPage,
        searchValue,
        categoryId,
        vendorId,
        pipelineId: parsedQuery.pipelineId,
        boardId: parsedQuery.boardId,
      },
      fetchPolicy: "network-only",
    });

  const { data: categoriesData } = useQuery<ProductCategoriesQueryResponse>(
    gql(productQueries.productCategories)
  );

  const saveFilter = () => {
    localStorage.setItem(
      "erxes_products:chooser_filter",
      JSON.stringify({ categoryId, vendorId })
    );
  };

  useEffect(() => {
    setPerPage(20)
    refetchProducts();
    saveFilter();
  }, [categoryId, vendorId, searchValue]);

  const handleSearch = (value: string, reload?: boolean) => {
    setSearchValue(value)
  };

  const renderProductCategoryChooser = () => (
    <>
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={vendorId}
        onSelect={(companyId) => setVendorId(companyId as string)}
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

  const renderDiscount = (data) => {
    if (isEnabled("loyalties") && loadDiscountPercent && data) {
      loadDiscountPercent({
        product: { _id: data._id },
        quantity: 1,
      });
    }
  };

  const loadMore = () => {
    setPerPage((prev) => prev + 20);
    refetchProducts();
  }

  const renderName = (product: IProduct) => {
    if (product.code && product.subUoms?.length) {
      return `${product.code} - ${product.name} ~${Math.round((1 / (product.subUoms[0].ratio || 1)) * 100) / 100
        } - ${product.unitPrice}`;
    }
    if (product.code) {
      return `${product.code} - ${product.name} - ${product.unitPrice.toLocaleString() || ""}`;
    }
    return product.name;
  };

  return (
    <Chooser
      data={{ name: data.name, datas: data.products }}
      title="Product"
      perPage={perPage}
      datas={productsData?.products || []}
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
    />
  );
};

export default ProductChooser;
