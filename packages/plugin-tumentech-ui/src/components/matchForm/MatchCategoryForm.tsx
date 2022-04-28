import { __, ProductChooser } from 'erxes-ui';
import React from 'react';
import { IProduct } from '../../types';

type Props = {
  products: IProduct[];
  closeModal: () => void;
  saveMatch: (productIds: string[]) => void;
};

type State = {
  categoryId: string;
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: ''
    };
  }

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  render() {
    const { categoryId } = this.state;

    const productOnChange = (products: IProduct[]) => {
      const productIds = products.map(p => p._id);
      this.props.saveMatch(productIds);
    };

    return (
      <ProductChooser
        data={{
          name: 'Product',
          products: this.props.products || []
        }}
        categoryId={categoryId}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        closeModal={this.props.closeModal}
      />
    );
  }
}

export default ProductForm;
function callback(): () => void {
  throw new Error('Function not implemented.');
}
