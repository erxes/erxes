import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
    const form = integration.form;

    return (
      <tr>
        <td>{form.title}</td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>0</td>
        <td>0.00%</td>
        <td>0</td>
        <td>{moment(form.createdDate).format('ll')}</td>
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
