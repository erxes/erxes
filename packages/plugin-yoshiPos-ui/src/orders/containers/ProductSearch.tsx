import React from 'react';
import queryString from 'query-string';

import SearchInput from '../../orders/components/SearchInput';
import { router } from '../../common/utils';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../types';
import { ProductSearch } from '../styles';

type Props = {
  productsQuery: any;
} & IRouterProps;

class SearchContainer extends React.Component<Props> {
  clearSearch = () => {
    router.setParams(this.props.history, { searchValue: '' });
    this.props.productsQuery.refetch();
  };

  onSearch = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const searchValue = e.currentTarget.value;

      router.setParams(this.props.history, { searchValue });
      this.props.productsQuery.refetch({ variables: { searchValue } });
    }
  };

  render() {
    const { location } = this.props;

    const qp = queryString.parse(location.search);

    return (
      <ProductSearch>
        <SearchInput
          onSearch={this.onSearch}
          clearSearch={this.clearSearch}
          placeholder="Search products"
          searchValue={qp.searchValue || ''}
        />
      </ProductSearch>
    );
  }
}

export default withRouter<Props>(SearchContainer);
