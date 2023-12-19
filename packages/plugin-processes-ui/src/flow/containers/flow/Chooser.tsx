import * as compose from 'lodash.flowright';
import Chooser from '@erxes/ui/src/components/Chooser';
import { gql } from '@apollo/client';
import productCategoriesQueries from '@erxes/ui-products/src/graphql/queries';
import ProductCategoryChooser from '@erxes/ui-products/src/components/ProductCategoryChooser';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { queries as flowQueries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

import { FlowsQueryResponse, IFlow } from '../../types';

type Props = {
  data: { name: string; flows: IFlow[] };
  categoryId?: string;
  status?: string[];
  isSub?: boolean;
  flowValidation?: string[];
  onChangeCategory: (categoryId: string) => void;
  closeModal: () => void;
  onSelect: (flows: IFlow[]) => void;
};

type FinalProps = {
  flowsQuery: FlowsQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class FlowChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.flowsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  renderProductCategoryChooser = () => {
    const { productCategoriesQuery, onChangeCategory } = this.props;

    return (
      <ProductCategoryChooser
        categories={productCategoriesQuery.productCategories || []}
        onChangeCategory={onChangeCategory}
      />
    );
  };

  render() {
    const { data, flowsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.flows },
      search: this.search,
      title: 'Flow',
      renderName: (flow: IFlow) => {
        return flow.name;
      },
      perPage: this.state.perPage,
      clearState: () => this.search('', true),
      datas: flowsQuery.flows || [],
      onSelect
    };

    return (
      <Chooser
        {...updatedProps}
        renderFilter={this.renderProductCategoryChooser}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { categoryId?: string; isSub?: boolean },
      FlowsQueryResponse,
      { perPage: number; categoryId?: string; isSub?: boolean }
    >(gql(flowQueries.flows), {
      name: 'flowsQuery',
      options: props => ({
        variables: {
          perPage: 20,
          categoryId: props.categoryId,
          isSub: props.isSub
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}, ProductCategoriesQueryResponse, {}>(
      gql(productCategoriesQueries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    )
  )(FlowChooser)
);
