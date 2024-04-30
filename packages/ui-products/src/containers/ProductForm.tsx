import * as compose from "lodash.flowright";

import { IButtonMutateProps, IRouterProps } from "@erxes/ui/src/types";
import { IConfigsMap, IProduct } from "../types";
import {
  ProductCategoriesQueryResponse,
  ProductsConfigsQueryResponse,
  UomsQueryResponse,
} from "@erxes/ui-products/src/types";
import { mutations, queries } from "../graphql";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import Form from "../components/ProductForm";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";
import { withRouter } from "react-router-dom";

type Props = {
  product?: IProduct;
  closeModal: () => void;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsConfigsQuery: ProductsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
} & Props &
  IRouterProps;

const ProductFormContainer = (props: FinalProps) => {
  const { productCategoriesQuery, productsConfigsQuery, uomsQuery } = props;

  if (
    productCategoriesQuery.loading ||
    productsConfigsQuery.loading ||
    uomsQuery.loading
  ) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const { unitPrice, productCount, minimiumCount } = values;
    const attachmentMoreArray: any[] = [];
    const attachment = values.attachment || undefined;
    const attachmentMore = values.attachmentMore || [];

    attachmentMore.map((attach) => {
      attachmentMoreArray.push({ ...attach, __typename: undefined });
    });

    values.unitPrice = Number(unitPrice);
    values.productCount = Number(productCount);
    values.minimiumCount = Number(minimiumCount);
    values.attachment = attachment
      ? { ...attachment, __typename: undefined }
      : null;
    values.attachmentMore = attachmentMoreArray;

    return (
      <ButtonMutate
        mutation={object ? mutations.productEdit : mutations.productAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const productCategories = productCategoriesQuery.productCategories || [];
  const configs = productsConfigsQuery.productsConfigs || [];
  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const uoms = uomsQuery.uoms || [];

  const updatedProps = {
    ...props,
    renderButton,
    productCategories,
    uoms,
    configsMap: configsMap || ({} as IConfigsMap),
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "productDetail",
    "products",
    "productsTotalCount",
    "productCategories",
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: "productCategoriesQuery",
      }
    ),
    graphql<{}, UomsQueryResponse>(gql(queries.uoms), {
      name: "uomsQuery",
    }),
    graphql<{}, ProductsConfigsQueryResponse>(gql(queries.productsConfigs), {
      name: "productsConfigsQuery",
    })
  )(withRouter<FinalProps>(ProductFormContainer))
);
