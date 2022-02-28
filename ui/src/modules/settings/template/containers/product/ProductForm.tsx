import * as compose from 'lodash.flowright';
import ButtonMutate from 'erxes-ui/lib/components/ButtonMutate';
import From from '../../components/product/ProductForm';
import gql from 'graphql-tag';
import React from 'react';
import { graphql } from 'react-apollo';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { IProductTemplate } from '../../types';
import { mutations } from '../../graphql';
import { ProductsQueryResponse } from 'modules/settings/productService/types';
import { ProductTemplateDetailQueryResponse } from '../../types';
import { queries } from '../../graphql';
import { withProps } from 'erxes-ui/lib/utils/core';

type Props = {
  productTemplate?: IProductTemplate;
  items?: IProductTemplate;
  closeModal: () => void;
  queryParams?: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
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

    return <From {...updatedProps} />;
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
