import React, { PropTypes, Component } from 'react';
import { Button, Label } from 'react-bootstrap';
import { ChannelForm } from '../containers';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';

const propTypes = {
  channel: PropTypes.object.isRequired,
  removeChannel: PropTypes.func.isRequired,
  saveChannel: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeChannel = this.removeChannel.bind(this);
  }

  removeChannel() {
    this.props.removeChannel(this.props.channel._id);
  }

  render() {
    const { channel, saveChannel } = this.props;
    const { name, description } = channel;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{name}</td>
        <td>{description}</td>
        <td><Label bsStyle="success">Active</Label></td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit channel" trigger={editTrigger}>
              <ChannelForm channel={channel} saveChannel={saveChannel} />
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
