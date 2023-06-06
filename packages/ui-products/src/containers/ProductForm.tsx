import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import From from '../components/ProductForm';
import { mutations, queries } from '../graphql';
import { IProduct, IConfigsMap } from '../types';
import {
  ProductCategoriesQueryResponse,
  ProductsConfigsQueryResponse,
  UomsQueryResponse
} from '@erxes/ui-products/src/types';

type Props = {
  product?: IProduct;
  closeModal: () => void;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsConfigsQuery: ProductsConfigsQueryResponse;
  uomsQuery: UomsQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productsConfigsQuery,
      uomsQuery
    } = this.props;

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
      object
    }: IButtonMutateProps) => {
      const { unitPrice, productCount, minimiumCount } = values;
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(attach => {
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

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    const uoms = uomsQuery.uoms || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      productCategories,
      uoms,
      configsMap: configsMap || ({} as IConfigsMap)
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'productDetail',
    'products',
    'productsTotalCount',
    'productCategories'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    ),
    graphql<{}, UomsQueryResponse>(gql(queries.uoms), {
      name: 'uomsQuery'
    }),
    graphql<{}, ProductsConfigsQueryResponse>(gql(queries.productsConfigs), {
      name: 'productsConfigsQuery'
    })
  )(ProductFormContainer)
);
