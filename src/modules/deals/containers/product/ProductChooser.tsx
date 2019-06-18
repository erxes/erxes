import gql from 'graphql-tag';
import { ButtonMutate, Chooser } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
import { Form as ProductForm } from 'modules/settings/productService/components';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import * as React from 'react';
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
        icon="checked-1"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
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
