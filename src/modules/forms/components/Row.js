import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ActionButtons,
  Tip,
  Button,
  Icon,
  ModalTrigger
} from 'modules/common/components';

const propTypes = {
  integration: PropTypes.object.isRequired
};

class Row extends Component {
  renderEditAction() {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size="large" title="Edit" trigger={editTrigger}>
        <div>hi</div>
      </ModalTrigger>
    );
  }

  render() {
    const { integration } = this.props;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>0</td>
        <td>0.00%</td>
        <td>0</td>
        <td>3 hours ago</td>
        <td>
          <ActionButtons>
            {this.renderEditAction()}
            <Tip text="Delete">
              <Button btnStyle="link" icon="close" />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
