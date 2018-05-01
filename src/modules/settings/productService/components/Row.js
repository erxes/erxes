import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Tip,
  Icon,
  ModalTrigger,
  ActionButtons
} from 'modules/common/components';
import { Form } from './';

const propTypes = {
  product: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

class Row extends Component {
  constructor(props) {
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
    const { __ } = this.context;
    const { product, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ product, save })}
      </ModalTrigger>
    );
  }

  render() {
    const { __ } = this.context;
    const { product } = this.props;

    return (
      <tr>
        <td>{product.name}</td>
        <td>{product.type}</td>
        <td>{product.description}</td>
        <td>{product.sku}</td>
        <td width="5%">
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

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
