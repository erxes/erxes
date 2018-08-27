import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table,
  ActionButtons,
  ModalTrigger,
  Tip,
  Label,
  Button,
  Icon
} from 'modules/common/components';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { InstallCode } from 'modules/settings/integrations/components';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func
};

class IntegrationList extends Component {
  getTypeName(integration) {
    const kind = integration.kind;

    if (kind === KIND_CHOICES.TWITTER) {
      return 'twitter';
    }

    if (kind === KIND_CHOICES.FACEBOOK) {
      return 'facebook';
    }

    if (kind === KIND_CHOICES.FORM) {
      return 'form';
    }

    return 'default';
  }

  renderMessengerActions(integration) {
    const { __ } = this.context;
    const kind = integration.kind;

    if (kind === KIND_CHOICES.MESSENGER) {
      const editTrigger = (
        <Button btnStyle="link">
          <Tip text="Install code">
            <Icon icon="copy" />
          </Tip>
        </Button>
      );

      return (
        <ActionButtons>
          <Tip text={__('Edit messenger integration')}>
            <Link
              to={`/settings/integrations/editMessenger/${integration._id}`}
            >
              <Button btnStyle="link" icon="edit" />
            </Link>
          </Tip>

          <ModalTrigger title="Install code" trigger={editTrigger}>
            <InstallCode integration={integration} />
          </ModalTrigger>
        </ActionButtons>
      );
    }

    return null;
  }

  renderRemoveAction(integration) {
    const { __ } = this.context;
    const { removeIntegration } = this.props;

    if (!removeIntegration) {
      return null;
    }

    return (
      <Tip text={__('Delete')}>
        <Button
          btnStyle="link"
          onClick={() => removeIntegration(integration)}
          icon="cancel-1"
        />
      </Tip>
    );
  }

  renderRow(integration) {
    const twitterData = (integration || {}).twitterData || {};

    return (
      <tr key={integration._id}>
        <td>
          {integration.name}
          {integration.kind === 'twitter' &&
            ` (${twitterData.info && twitterData.info.screen_name})`}
        </td>
        <td>
          <Label className={`label-${this.getTypeName(integration)}`}>
            {integration.kind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>
          <ActionButtons>
            {this.renderMessengerActions(integration)}
            {this.renderRemoveAction(integration)}
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { integrations } = this.props;
    const { __ } = this.context;

    return (
      <Fragment>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Kind')}</th>
              <th>{__('Brand')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{integrations.map(i => this.renderRow(i))}</tbody>
        </Table>
      </Fragment>
    );
  }
}

IntegrationList.propTypes = propTypes;
IntegrationList.contextTypes = {
  __: PropTypes.func
};

export default IntegrationList;
