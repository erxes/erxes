import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, confirm } from 'modules/common/utils';
import {
  ModalTrigger,
  Tip,
  ActionButtons,
  Button,
  Label,
  Icon
} from 'modules/common/components';
import { KIND_CHOICES } from '../constants';
import { Messenger } from '../containers';

const propTypes = {
  integration: PropTypes.object.isRequired,
  removeIntegration: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeIntegration = this.removeIntegration.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
  }

  removeIntegration() {
    confirm().then(() => {
      const { integration, removeIntegration } = this.props;

      removeIntegration(integration._id, error => {
        if (error) {
          return Alert.error(error.reason);
        }

        return Alert.success('Congrats');
      });
    });
  }

  renderExtraLinks() {
    const { __ } = this.context;
    const { integration, refetch } = this.props;
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
              <Button btnStyle="link" icon="paintbucket" />
            </Link>
          </Tip>

          <Tip text={__('Hours, Availability & Other configs')}>
            <Link
              to={`/settings/integrations/messenger/configs/${integration._id}`}
            >
              <Button btnStyle="link" icon="gear-a" />
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
    let type = 'defult';

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
    const { __ } = this.context;
    const { integration } = this.props;
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
        <td>{integration.brand ? integration.brand.name : ''}</td>

        <td>
          <ActionButtons>
            {this.renderExtraLinks()}
            <Tip text={__('Delete')}>
              <Button
                btnStyle="link"
                onClick={this.removeIntegration}
                icon="close"
              />
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
