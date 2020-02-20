import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import CategoryFrom from '../../components/productCategory/CategoryForm';
import { mutations, queries } from '../../graphql';

import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IProductCategory, ProductCategoriesQueryResponse } from '../../types';

type Props = {
  categories: IProductCategory[];
  category?: IProductCategory;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {

      return (
        <ButtonMutate
          mutation={object ? mutations.productCategoryEdit : mutations.productCategoryAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      productCategories
    };

    return <CategoryFrom {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['category'];
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
