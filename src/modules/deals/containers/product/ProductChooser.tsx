import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Chooser from 'modules/common/components/Chooser';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import ProductForm from 'modules/settings/productService/components/Form';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { IProduct, IProductDoc } from '../../../settings/productService/types';
import { ProductAddMutationResponse, ProductsQueryResponse } from '../../types';

type Props = {
  data: { name: string; products: IProduct[] };
  closeModal: () => void;
  onSelect: (products: IProduct[]) => void;
};

type FinalProps = { productsQuery: ProductsQueryResponse } & Props &
  ProductAddMutationResponse;

class ProductChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  clearState = () => {
    this.props.productsQuery.refetch({ searchValue: '' });
  };

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.productsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  // add product
  addProduct = (doc: IProductDoc, callback: () => void) => {
    this.props
      .productAdd({
        variables: doc
      })
      .then(() => {
        this.props.productsQuery.refetch();

        Alert.success('You successfully added a product or service');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={productMutations.productAdd}
        variables={values}
        callback={callback}
        refetchQueries={this.props.productsQuery.refetch()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  render() {
    const { data, productsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.products },
      search: this.search,
      title: 'Product',
      renderName: (product: IProduct) => product.name,
      renderForm: ({ closeModal }: { closeModal: () => void }) => (
        <ProductForm closeModal={closeModal} renderButton={this.renderButton} />
      ),
      perPage: this.state.perPage,
      add: this.addProduct,
      clearState: this.clearState,
      datas: productsQuery.products || [],
      onSelect
    };

    return <Chooser {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, ProductsQueryResponse, { perPage: number }>(
      gql(productQueries.products),
      {
        name: 'productsQuery',
        options: {
          variables: {
            perPage: 20
          }
        }
      }
    ),
    // mutations
    graphql<{}, ProductAddMutationResponse, IProduct>(
      gql(productMutations.productAdd),
      {
        name: 'productAdd',
        options: () => ({
          refetchQueries: [
            {
              query: gql(productQueries.products),
              variables: { perPage: 20 }
            }
          ]
        })
      }
    )
  )(ProductChooser)
);
