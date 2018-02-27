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
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { Form, Messenger } from 'modules/settings/integrations/containers';

const propTypes = {
  integration: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired
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
                <Icon icon="paintbucket" />
              </Button>
            </Link>
          </Tip>

          <Tip text={__('Hours, Availability & Other configs')}>
            <Link to={`integrations/messenger/configs/${integration._id}`}>
              <Button btnStyle="link">
                <Icon icon="gear-a" />
              </Button>
            </Link>
          </Tip>

          <ModalTrigger title="Edit integration" trigger={editTrigger}>
            <Messenger integration={integration} refetch={refetch} />
          </ModalTrigger>
        </ActionButtons>
      );
    }

    if (kind === KIND_CHOICES.FORM) {
      return (
        <ModalTrigger title="Edit integration" trigger={editTrigger}>
          <Form integration={integration} refetch={refetch} />
        </ModalTrigger>
      );
    }

    return null;
  }

  getTypeName() {
    const kind = this.props.integration.kind;
    let type = 'default';

    if (kind === KIND_CHOICES.FORM) {
      type = 'form';
    }

    if (kind === KIND_CHOICES.TWITTER) {
      type = 'twitter';
    }

    if (kind === KIND_CHOICES.FACEBOOK) {
      type = 'facebook';
    }

    return type;
  }

  render() {
    const { integration } = this.props;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${this.getTypeName()}`}>
            {integration.kind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
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
