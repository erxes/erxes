import {
  ActionButtons,
  Button,
  Icon,
  Label,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React, { Component } from 'react';
import { IProduct } from '../types';
import { Form } from './';

type Props = {
  product: IProduct;
  remove: (_id: string) => void;
  save: ({ doc }: { doc: any; }, callback: () => void, product?: IProduct) => void;
};

class Row extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.renderEditForm = this.renderEditForm.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
    this.remove = this.remove.bind(this);
  }

  remove() {
    const { product } = this.props;

    this.props.remove(product._id);
  }

  renderEditForm(props) {
    return <Form {...props} />;
  }

  renderEditAction() {
    const { product, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger 
        title="Edit" 
        trigger={editTrigger}
        content={(props) => <Form {...props} product={product} save={save} />}
      />
    );
  }

  render() {
    const { product } = this.props;

    return (
      <tr>
        <td>{product.name}</td>
        <td>{product.type}</td>
        <td>{product.description}</td>
        <td>{product.sku && <Label>{product.sku}</Label>}</td>
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
