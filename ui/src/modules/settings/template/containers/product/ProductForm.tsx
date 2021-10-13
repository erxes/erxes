import React from 'react';
import ButtonMutate from 'erxes-ui/lib/components/ButtonMutate';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import From from '../../components/product/ProductForm';
import { mutations } from '../../graphql';
import { IProductTemplate } from '../../types';
import * as compose from 'lodash.flowright';
import { withProps } from 'erxes-ui/lib/utils/core';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import { ProductCategoriesQueryResponse } from '../../types'
import { queries } from '../../graphql'


type Props = {
  productTemplate?: IProductTemplate;
  closeModal: () => void;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery } = this.props;

    if (productCategoriesQuery.loading) {
      return null;
    }

    const productCategories = productCategoriesQuery.productCategories || [];

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
          mutation={object ? mutations.productTemplatesEdit : mutations.productTemplatesAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      productCategories,
      renderButton
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productCategories'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    )
  )(ProductFormContainer)
);
