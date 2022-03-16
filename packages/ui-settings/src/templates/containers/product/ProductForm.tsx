import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { ProductsQueryResponses } from '@erxes/ui-products/src/types';
import React from 'react';
import { graphql } from 'react-apollo';

import Form from '../../components/product/ProductForm';
import { mutations, queries } from '../../graphql';
import {
  IProductTemplate,
  ProductTemplateDetailQueryResponse
} from '../../types';

type Props = {
  productTemplate?: IProductTemplate;
  items?: IProductTemplate;
  closeModal: () => void;
  queryParams?: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponses;
  productTemplateDetailQuery: ProductTemplateDetailQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { productTemplateDetailQuery } = this.props;

    if (productTemplateDetailQuery.loading) {
      return null;
    }

    const productTemplate =
      productTemplateDetailQuery.productTemplateDetail ||
      this.props.productTemplate;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={
            object
              ? mutations.productTemplatesEdit
              : mutations.productTemplatesAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      productTemplate,
      renderButton
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productTemplates'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplateDetailQueryResponse, {}>(
      gql(queries.productTemplateDetail),
      {
        name: 'productTemplateDetailQuery',
        skip: productTemplate => !productTemplate,
        options: ({ productTemplate }) => ({
          variables: { _id: productTemplate ? productTemplate._id : '' },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductFormContainer)
);
