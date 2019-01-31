import {
  ActionButtons,
  Button,
  Icon,
  ModalTrigger,
  TextInfo,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IProduct } from '../types';
import { Form } from './';

type Doc = {
  type: string;
  _id?: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

type Props = {
  product: IProduct;
  remove: (productId: string) => void;
  save: (doc: Doc, callback: () => void, product?: IProduct) => void;
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
    const { product, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => <Form {...props} product={product} save={save} />;

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
