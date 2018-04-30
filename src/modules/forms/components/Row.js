import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Alert, confirm } from 'modules/common/utils';
import {
  Tip,
  Button,
  Icon,
  ModalTrigger,
  FormControl,
  Tags,
  ActionButtons
} from 'modules/common/components';
import { Manage } from './';

const propTypes = {
  integration: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func,
  remove: PropTypes.func
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    confirm().then(() => {
      const { integration, remove } = this.props;

      remove(integration._id, error => {
        if (error) {
          return Alert.error(error.reason);
        }

        return Alert.success('Congrats');
      });
    });
  }

  renderUser(createdUserId) {
    return this.props.members.map(
      user =>
        user._id === createdUserId && (
          <div key={user._id}>{user.details.fullName}</div>
        )
    );
  }

  manageAction(integration) {
    const { __ } = this.context;

    return (
      <Link to={`/forms/edit/${integration._id}/${integration.formId}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')}>
            <Icon icon="edit" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderEditAction(integration) {
    const { __ } = this.context;

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Install code')}>
          <Icon icon="copy" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger title="Install code" trigger={trigger}>
        <Manage integration={integration} />
      </ModalTrigger>
    );
  }

  render() {
    const { integration, toggleBulk } = this.props;
    const { __ } = this.context;
    const form = integration.form || {};
    const createdUserId = form.createdUserId;
    const tags = integration.tags || [];

    let percentage = '0.00';

    if (form.contactsGathered && form.viewCount) {
      percentage = form.contactsGathered / form.viewCount * 100;
      percentage = percentage.toString();
    }

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(integration, e.target.checked);
      }
    };

    return (
      <tr>
        <td>
          <FormControl componentClass="checkbox" onChange={onChange} />
        </td>
        <td>{integration.name}</td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{form.viewCount || 0}</td>
        <td>{percentage.substring(0, 4)} %</td>
        <td>
          <Link to={`/customers?form=${integration.formId}`}>
            {form.contactsGathered || 0}
          </Link>
        </td>
        <td>{moment(form.createdDate).format('ll')}</td>
        <td>{this.renderUser(createdUserId)}</td>
        <td>
          <Tags tags={tags} limit={2} />
        </td>
        <td>
          <ActionButtons>
            {this.manageAction(integration)}
            {this.renderEditAction(integration)}
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
