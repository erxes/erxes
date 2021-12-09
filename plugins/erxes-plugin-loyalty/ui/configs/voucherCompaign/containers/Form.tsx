import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import {ButtonMutate, withProps} from 'erxes-ui';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import From from '../components/Form';
import { mutations, queries } from '../graphql';
import { mutations as productMutations, queries as productQueries} from 'erxes-ui/lib/products/graphql';
import { IVoucherCompaign } from '../types';
import { ProductCategoriesQueryResponse, ProductsQueryResponse } from 'erxes-ui/lib/products/types';

type Props = {
  voucherCompaign?: IVoucherCompaign;
  closeModal: () => void;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsQuery: ProductsQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery, productsQuery } = this.props;

    if (productCategoriesQuery.loading || productsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(attachment => {
        attachmentMoreArray.push({ ...attachment, __typename: undefined });
      })

      values.attachment = attachment ? { ...attachment, __typename: undefined } : null;
      values.attachmentMore = attachmentMoreArray;

      return (
        <ButtonMutate
          mutation={object && object._id ? mutations.voucherCompaignsEdit : mutations.voucherCompaignsAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const productCategories = productCategoriesQuery.productCategories || [];
    const products = productsQuery.products || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      productCategories,
      products
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['voucherCompaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(productQueries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    ),
    graphql<Props, ProductsQueryResponse>(
      gql(productQueries.products),
      {
        name: 'productsQuery'
      }
    )
  )(ProductFormContainer)
);
