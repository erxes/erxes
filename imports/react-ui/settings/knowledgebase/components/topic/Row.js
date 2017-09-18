import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { KbTopic } from '../../containers';

const propTypes = {
  item: PropTypes.object.isRequired,
  removeItem: PropTypes.func.isRequired,
};

class KbTopicRow extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { item, removeItem } = this.props;

    removeItem(item._id, error => {
      if (error) {
        return Alert.error("Can't delete a integration", error.reason);
      }

      return Alert.success('Congrats', 'Integration has deleted.');
    });
  }

  render() {
    const { item } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{item.title}</td>
        <td>{item.description}</td>
        <td>{item.brand.name}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit category" trigger={editTrigger}>
              <KbTopic item={item} />
            </ModalTrigger>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.remove}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

KbTopicRow.propTypes = propTypes;

export default KbTopicRow;
