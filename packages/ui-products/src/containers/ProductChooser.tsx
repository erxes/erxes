import { gql, useMutation, useQuery } from "@apollo/client";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import Chooser from "@erxes/ui/src/components/Chooser";
import { Alert } from "@erxes/ui/src/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import ProductCategoryChooser from "../components/ProductCategoryChooser";
import {
  mutations as productMutations,
  queries as productQueries,
} from "../graphql";
import {
  IProduct,
  IProductDoc,
  ProductAddMutationResponse,
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
  const [categoryId, setCategoryId] = useState<string | undefined>(
    propCategoryId
  );
  const [vendorId, setVendorId] = useState<string | undefined>(propVendorId);

  const parsedQuery = queryString.parse(location.search);

  const { data: productsData, refetch: refetchProducts } =
    useQuery<ProductsQueryResponse>(gql(productQueries.products), {
      variables: {
        perPage,
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

  const [addProductMutation] = useMutation<
    ProductAddMutationResponse,
    IProduct
  >(gql(productMutations.productAdd));

  useEffect(() => {
    const savedFilters = JSON.parse(
      localStorage.getItem("erxes_products:chooser_filter") || "{}"
    );

    const variables: any = { perPage };

    if (savedFilters.categoryId) {
      setCategoryId(savedFilters.categoryId);
      variables.categoryId = categoryId;
    }

    if (savedFilters.vendorId) {
      setVendorId(savedFilters.vendorId);
      variables.vendorId = vendorId;
    }

    if (savedFilters.vendorId || savedFilters.categoryId) {
      refetchProducts({
        ...variables,
      });
    }
  }, []);

  const saveFilter = () => {
    localStorage.setItem(
      "erxes_products:chooser_filter",
      JSON.stringify({ categoryId, vendorId })
    );
  };

  const handleSearch = (value: string, reload?: boolean) => {
    if (!reload) setPerPage(0);

    const newPerPage = perPage + 20;
    setPerPage(newPerPage);

    refetchProducts({ searchValue: value, perPage: newPerPage });
  };

  const handleChangeCategory = (id: string) => {
    setCategoryId(id);
    refetchProducts({ categoryId: id, perPage });
    saveFilter();
  };

  const handleChangeVendor = (id: string) => {
    setVendorId(id);
    refetchProducts({ vendorId: id, perPage });
    saveFilter();
  };

  const addProduct = (doc: IProductDoc, callback: () => void) => {
    addProductMutation({ variables: doc })
      .then(() => {
        refetchProducts();
        Alert.success("You successfully added a product or service");
        callback();
      })
      .catch((e) => Alert.error(e.message));
  };

  const renderProductCategoryChooser = () => (
    <>
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={vendorId}
        onSelect={(company) => handleChangeVendor(company as string)}
        customOption={{ label: "Choose company", value: "" }}
      />
      <ProductCategoryChooser
        currentId={categoryId}
        categories={categoriesData?.productCategories || []}
        onChangeCategory={handleChangeCategory}
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

  const renderName = (product: IProduct) => {
    if (product.code && product.subUoms?.length) {
      return `${product.code} - ${product.name} ~${
        Math.round((1 / (product.subUoms[0].ratio || 1)) * 100) / 100
      } - ${product.unitPrice}`;
    }
    if (product.code) {
      return `${product.code} - ${product.name} - ${product.unitPrice || ""}`;
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
      add={addProduct}
      renderName={renderName}
      renderForm={({ closeModal }) => <ProductForm closeModal={closeModal} />}
      renderFilter={renderProductCategoryChooser}
      handleExtra={renderDiscount}
      modalSize="xl"
      closeModal={closeModal}
      limit={limit}
    />
  );
};

export default ProductChooser;
