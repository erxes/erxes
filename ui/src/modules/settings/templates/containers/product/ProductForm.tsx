import ButtonMutate from 'erxes-ui/lib/components/ButtonMutate';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { withProps } from 'erxes-ui/lib/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { ProductsQueryResponse } from 'modules/settings/productService/types';
import React from 'react';
import { graphql } from 'react-apollo';

import Form from '../../components/product/ProductForm';
import { mutations, queries } from '../../graphql';
import {
  IProductTemplate,
  ProductTemplateDetailQueryResponse,
  ProductTemplatesQueryResponse
} from '../../types';

type Props = {
  productTemplate?: IProductTemplate;
  items?: IProductTemplate;
  closeModal: () => void;
  queryParams?: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productTemplateDetailQuery: ProductTemplateDetailQueryResponse;
  productTemplatesQuery: ProductTemplatesQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { productTemplateDetailQuery, productTemplatesQuery } = this.props;

    if (productTemplateDetailQuery.loading || productTemplatesQuery.loading) {
      return null;
    }

    const productTemplate =
      productTemplateDetailQuery.productTemplateDetail ||
      this.props.productTemplate;

    const productTemplates = productTemplatesQuery.productTemplates || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachment = values.templateImage || undefined;

      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);
      values.templateImage = attachment
        ? { ...attachment, __typename: undefined }
        : null;

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
      productTemplates,
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
    ),
    graphql<Props, ProductTemplatesQueryResponse>(
      gql(queries.productTemplates),
      {
        name: 'productTemplatesQuery',
        options: () => ({
          variables: {
            status: 'active'
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductFormContainer)
);
