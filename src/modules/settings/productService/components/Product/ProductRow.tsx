import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Form from '../../containers/Product/ProductForm';
import { IProduct } from '../../types';

type Props = {
  product: IProduct;
  remove: (productId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Row extends React.Component<Props> {
  remove = () => {
    const { product } = this.props;

    this.props.remove(product._id);
  };

  renderEditForm = props => {
    return <Form {...props} />;
  };

  renderEditAction = () => {
    const { product, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <Form {...props} product={product} renderButton={renderButton} />
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} content={content} />
    );
  };

  render() {
    const { product } = this.props;

    return (
      <tr>
        <td>{product.name}</td>
        <td>
          <TextInfo>{product.type}</TextInfo>
        </td>
        <td>{product.description}</td>
        <td>
          {product.sku && (
            <TextInfo textStyle="primary">{product.sku}</TextInfo>
          )}
        </td>
        <td>
          <ActionButtons>
            {this.renderEditAction()}

            <Tip text={__('Delete')}>
              <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
