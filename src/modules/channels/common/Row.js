import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Alert, confirm } from 'modules/common/utils';
import {
  ModalTrigger,
  Tip,
  Button,
  Icon,
  ActionButtons
} from 'modules/common/components';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { Form, Messenger } from '../integrations/containers';

const propTypes = {
  integration: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired
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
        <ActionButtons>
          <Tip text="Appearance">
            <Link to={`/channels/messenger/appearance/${integration._id}`}>
              <Button btnStyle="link">
                <Icon icon="paintbucket" />
              </Button>
            </Link>
          </Tip>

          <Tip text="Hours, Availability & Other configs">
            <Link to={`/channels/messenger/configs/${integration._id}`}>
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

  renderActions() {
    return (
      <td>
        <ActionButtons>
          {this.renderExtraLinks()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove}>
              <Icon icon="close" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
