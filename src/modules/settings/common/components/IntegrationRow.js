import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ActionButtons,
  ModalTrigger,
  Tip,
  Label,
  Button,
  Icon
} from 'modules/common/components';
import { Messenger } from 'modules/settings/integrations/containers';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';

const propTypes = {
  integration: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired,
  showBrand: PropTypes.bool
};

class IntegrationRow extends Component {
  constructor(props) {
    super(props);

    this.getTypeName = this.getTypeName.bind(this);
  }

  renderExtraLinks() {
    const { integration, refetch } = this.props;
    const { __ } = this.context;
    const kind = integration.kind;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    if (kind === KIND_CHOICES.MESSENGER) {
      return (
        <ActionButtons>
          <Tip text={__('Appearance')}>
            <Link
              to={`/settings/integrations/messenger/appearance/${
                integration._id
              }`}
            >
              <Button btnStyle="link">
                <Icon icon="paintpalette" />
              </Button>
            </Link>
          </Tip>

          <Tip text={__('Hours, Availability & Other configs')}>
            <Link to={`integrations/messenger/configs/${integration._id}`}>
              <Button btnStyle="link">
                <Icon icon="settings" />
              </Button>
            </Link>
          </Tip>

          <ModalTrigger title="Edit integration" trigger={editTrigger}>
            <Messenger integration={integration} refetch={refetch} />
          </ModalTrigger>
        </ActionButtons>
      );
    }

    return null;
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

    return (
      <tr>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${this.getTypeName()}`}>
            {integration.kind}
          </Label>
        </td>
        {showBrand && (
          <td>{integration.brand ? integration.brand.name : ''}</td>
        )}
        <td>
          <ActionButtons>{this.renderExtraLinks()}</ActionButtons>
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
