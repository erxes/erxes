import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import {
  ModalTrigger,
  Tip,
  ActionButtons,
  Button,
  Label,
  Icon
} from 'modules/common/components';
import { KIND_CHOICES } from '../constants';
import { Form, Messenger } from '../containers';
import { confirm } from 'modules/common/utils';

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
    const { integration, refetch } = this.props;
    const kind = integration.kind;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    if (kind === KIND_CHOICES.MESSENGER) {
      return (
        <div style={{ display: 'inline-block' }}>
          <Tip text="Appearance">
            <Link
              to={`/settings/integrations/messenger/appearance/${integration._id}`}
            >
              <Button btnStyle="link">
                <Icon icon="paintbucket" />
              </Button>
            </Link>
          </Tip>

          <Tip text="Hours, Availability & Other configs">
            <Link
              to={`/settings/integrations/messenger/configs/${integration._id}`}
            >
              <Button btnStyle="link">
                <Icon icon="gear-a" />
              </Button>
            </Link>
          </Tip>

          <ModalTrigger title="Edit integration" trigger={editTrigger}>
            <Messenger integration={integration} refetch={refetch} />
          </ModalTrigger>
        </div>
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
    let type = 'defult';

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
    const integration = this.props.integration;

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
          <ActionButtons>
            {this.renderExtraLinks()}
            <Tip text="Delete">
              <Button btnStyle="link" onClick={this.removeIntegration}>
                <Icon icon="close" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
