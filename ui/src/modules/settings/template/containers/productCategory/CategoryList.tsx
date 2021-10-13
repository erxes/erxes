import React from 'react';
import List from '../../components/productCategory/CategoryList';

type Props = { history: any; queryParams: any };
class ProductListContainer extends React.Component<Props> {
  render() {
    const updatedProps = {
      ...this.props,
      loading: false,
      productCategoriesCount: 0
    };

    return <List {...updatedProps} />;
  }
}

export default ProductListContainer;
