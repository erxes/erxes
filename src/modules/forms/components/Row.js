import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ActionButtons, Tip, Button, Icon } from 'modules/common/components';

const propTypes = {
  integration: PropTypes.object.isRequired
};

class Row extends Component {
  renderEditAction(integration) {
    return (
      <Link to={`/forms/edit/${integration._id}/${integration.formId}`}>
        <Button btnStyle="link">
          <Tip text="Edit">
            <Icon icon="edit" />
          </Tip>
        </Button>
      </Link>
    );
  }

  render() {
    const { integration } = this.props;
    const form = integration.form;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{form.viewCount}</td>
        <td>{form.contactsGathered / form.viewCount} %</td>
        <td>{form.contactsGathered}</td>
        <td>{moment(form.createdDate).format('ll')}</td>
        <td>
          <ActionButtons>
            {this.renderEditAction(integration)}
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
