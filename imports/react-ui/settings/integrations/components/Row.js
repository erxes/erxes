import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { Chat, Form, InAppMessaging } from '../containers';

const propTypes = {
  integration: PropTypes.object.isRequired,
  removeIntegration: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeIntegration = this.removeIntegration.bind(this);
  }

  removeIntegration() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { integration, removeIntegration } = this.props;

    removeIntegration(integration._id, error => {
      if (error) {
        return Alert.error("Can't delete a integration", error.reason);
      }

      return Alert.success('Congrats', 'Integration has deleted.');
    });
  }

  renderExtraLinks() {
    const integration = this.props.integration;
    const kind = integration.kind;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    if (kind === KIND_CHOICES.IN_APP_MESSAGING) {
      return (
        <div style={{ display: 'inline-block' }}>
          <Tip text="Appearance">
            <Button
              bsStyle="link"
              href={`/settings/integrations/in_app_messaging/appearance/${integration._id}`}
            >
              <i className="ion-paintbucket" />
            </Button>
          </Tip>

          <Tip text="Hours & Availability">
            <Button
              bsStyle="link"
              href={`/settings/integrations/in_app_messaging/availability/${integration._id}`}
            >
              <i className="ion-gear-a" />
            </Button>
          </Tip>

          <ModalTrigger title="Edit integration" trigger={editTrigger}>
            <InAppMessaging integration={integration} />
          </ModalTrigger>
        </div>
      );
    }

    if (kind === KIND_CHOICES.CHAT) {
      return (
        <ModalTrigger title="Edit integration" trigger={editTrigger}>
          <Chat integration={integration} />
        </ModalTrigger>
      );
    }

    if (kind === KIND_CHOICES.FORM) {
      return (
        <ModalTrigger title="Edit integration" trigger={editTrigger}>
          <Form integration={integration} />
        </ModalTrigger>
      );
    }

    return null;
  }

  render() {
    const integration = this.props.integration;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>{integration.kind}</td>
        <td>{integration.brand().name}</td>

        <td className="text-right">
          <ActionButtons>
            {this.renderExtraLinks()}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeIntegration}>
                <i className="ion-close-circled" />
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
