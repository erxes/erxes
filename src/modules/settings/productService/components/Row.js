import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tip, Icon, ModalTrigger } from 'modules/common/components';
import { Form } from '../containers';
import { ActionButtons, TableRow } from '../../styles';

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
    const { remove, product } = this.props;
    remove(product._id);
  }

  renderEditForm(props) {
    return <Form {...props} />;
  }

  renderEditAction() {
    const { product, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
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
    const { product } = this.props;

    return (
      <TableRow>
        <td>{product.name}</td>
        <td>{product.type}</td>
        <td>{product.description}</td>
        <td>{product.sku}</td>
        <td width="5%">
          <ActionButtons>
            {this.renderEditAction()}
            <Tip text="Delete">
              <Button btnStyle="link" onClick={this.remove} icon="close" />
            </Tip>
          </ActionButtons>
        </td>
      </TableRow>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
