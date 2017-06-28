import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { KbTopic } from '../containers';

const propTypes = {
  kbTopic: PropTypes.object.isRequired,
  removeKbTopic: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeKbTopic = this.removeKbTopic.bind(this);
  }

  removeKbTopic() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { kbGroup, removeKbTopic } = this.props;

    removeKbTopic(kbGroup._id, error => {
      if (error) {
        return Alert.error("Can't delete a integration", error.reason);
      }

      return Alert.success('Congrats', 'Integration has deleted.');
    });
  }

  renderExtraLinks() {
    const kbTopic = this.props.kbTopic;
    const kind = kbTopic.kind;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return null;
  }

  render() {
    const kbTopic = this.props.kbTopic;

    return (
      <tr>
        <td>{kbTopic.name}</td>
        <td />
        <td />

        <td className="text-right">
          <ActionButtons>
            {this.renderExtraLinks()}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeKbTopic}>
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
