import * as compose from 'lodash.flowright';

import {
  ConfigsQueryResponse,
  IConfigsMap,
  IProduct,
  ProductCategoriesQueryResponse,
  ProductsConfigsQueryResponse,
  UomsQueryResponse,
} from '../types';
import { mutations, queries } from '../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/ProductForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  product?: IProduct;
  closeModal: () => void;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsConfigsQuery: ProductsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
} & Props;

const ProductFormContainer = (props: FinalProps) => {
  const {
    productCategoriesQuery,
    productsConfigsQuery,
    uomsQuery,
    configsQuery,
  } = props;

  if (
    productCategoriesQuery.loading ||
    productsConfigsQuery.loading ||
    uomsQuery.loading ||
    configsQuery.loading
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
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const productCategories = productCategoriesQuery.productCategories || [];
  const configs = productsConfigsQuery.productsConfigs || [];
  const configsMap = {};
  const currencies = configsQuery.configsGetValue.value || [];

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
    currencies,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'productDetail',
    'products',
    'productsTotalCount',
    'productCategories',
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery',
      }
    ),
    graphql<Props, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: () => ({
        variables: {
          code: 'dealCurrency',
        },
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<{}, UomsQueryResponse>(gql(queries.uoms), {
      name: 'uomsQuery',
    }),
    graphql<{}, ProductsConfigsQueryResponse>(gql(queries.productsConfigs), {
      name: 'productsConfigsQuery',
    })
  )(ProductFormContainer)
);
