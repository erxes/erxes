import React, { PropTypes, Component } from 'react';
import { Button, Label } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ChannelForm } from '../containers';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';


const propTypes = {
  channel: PropTypes.object.isRequired,
  removeChannel: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeChannel = this.removeChannel.bind(this);
  }

  removeChannel() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    const { channel, removeChannel } = this.props;

    removeChannel(channel._id, error => {
      if (error) {
        return Alert.error('Can\'t delete a channel', error.reason);
      }

      return Alert.success('Congrats', 'Channel has deleted.');
    });
  }

  render() {
    const { name, description } = this.props.channel;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{name}</td>
        <td>{description}</td>
        <td><Label>Active</Label></td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit channel" trigger={editTrigger}>
              <ChannelForm channel={this.props.channel} />
            </ModalTrigger>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeChannel}>
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
