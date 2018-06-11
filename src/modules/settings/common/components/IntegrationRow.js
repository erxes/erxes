import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, confirm } from 'modules/common/utils';
import {
  ActionButtons,
  ModalTrigger,
  Tip,
  Label,
  Button,
  Icon
} from 'modules/common/components';
import { InstallCode } from 'modules/settings/integrations/components';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';

const propTypes = {
  integration: PropTypes.object.isRequired,
  removeIntegration: PropTypes.func,
  refetch: PropTypes.func.isRequired,
  showBrand: PropTypes.bool
};

class IntegrationRow extends Component {
  constructor(props) {
    super(props);

    this.removeIntegration = this.removeIntegration.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
  }

  removeIntegration() {
    confirm().then(() => {
      const { integration, removeIntegration, refetch } = this.props;

      removeIntegration(integration._id, error => {
        if (error) {
          return Alert.error(error.reason);
        }
        refetch();
        return Alert.success('Congrats');
      });
    });
  }

  renderExtraLinks() {
    const { integration, refetch } = this.props;
    const { __ } = this.context;
    const kind = integration.kind;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Install code">
          <Icon icon="copy" />
        </Tip>
      </Button>
    );

    if (kind === KIND_CHOICES.MESSENGER) {
      return (
        <ActionButtons>
          <Tip text={__('Hours, Availability & Other configs')}>
            <Link
              to={`/settings/integrations/editMessenger/${integration._id}`}
            >
              <Button btnStyle="link" icon="settings" />
            </Link>
          </Tip>

          <ModalTrigger title="Install code" trigger={editTrigger}>
            <InstallCode integration={integration} refetch={refetch} />
          </ModalTrigger>
        </ActionButtons>
      );
    }

    return null;
  }

  renderRemoveButton() {
    const { __ } = this.context;

    if (!this.props.removeIntegration) {
      return null;
    }

    return (
      <Tip text={__('Delete')}>
        <Button
          btnStyle="link"
          onClick={this.removeIntegration}
          icon="cancel-1"
        />
      </Tip>
    );
  }

  getTypeName() {
    const kind = this.props.integration.kind;
    let type = 'default';

    if (kind === KIND_CHOICES.TWITTER) {
      type = 'twitter';
    }

    if (kind === KIND_CHOICES.FACEBOOK) {
      type = 'facebook';
    }

    if (kind === KIND_CHOICES.FORM) {
      type = 'form';
    }

    return type;
  }

  render() {
    const { integration, showBrand } = this.props;
    const twitterData = (integration || {}).twitterData || {};

    return (
      <tr>
        <td>
          {integration.name}
          {integration.kind === 'twitter' &&
            ` (${twitterData.info && twitterData.info.screen_name})`}
        </td>
        <td>
          <Label className={`label-${this.getTypeName()}`}>
            {integration.kind}
          </Label>
        </td>
        {showBrand && (
          <td>{integration.brand ? integration.brand.name : ''}</td>
        )}
        <td>
          <ActionButtons>
            {this.renderExtraLinks()}
            {this.renderRemoveButton()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

IntegrationRow.propTypes = propTypes;
IntegrationRow.contextTypes = {
  __: PropTypes.func
};

export default IntegrationRow;
