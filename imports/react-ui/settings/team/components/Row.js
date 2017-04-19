import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { InviteForm } from '../containers';

const propTypes = {
  user: PropTypes.object.isRequired,
  deactivate: PropTypes.func.isRequired,
  updateInvitationInfos: PropTypes.func.isRequired,
  channels: PropTypes.array.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.deactivate = this.deactivate.bind(this);
  }

  deactivate() {
    if (!confirm('Are you sure?')) {
      return;
    } // eslint-disable-line no-alert

    const { user, deactivate } = this.props;

    deactivate(user._id, error => {
      if (error) {
        return Alert.error(error.reason);
      }

      return Alert.success('User has now deactivated.');
    });
  }

  renderRole() {
    const user = this.props.user;

    if (user.isOwner) {
      return 'owner';
    }

    return user.details.role;
  }

  render() {
    const { details, emails } = this.props.user;

    const updateTrigger = (
      <Button bsStyle="link">
        <Tip text="Update invitation infos"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{details.fullName}</td>
        <td>{emails[0].address}</td>
        <td>
          {this.renderRole()}
        </td>
        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Update invitation infos" trigger={updateTrigger}>
              <InviteForm
                channels={this.props.channels}
                save={this.props.updateInvitationInfos}
                user={this.props.user}
              />
            </ModalTrigger>

            <Tip text="Deactivate">
              <Button bsStyle="link" onClick={this.deactivate}>
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
