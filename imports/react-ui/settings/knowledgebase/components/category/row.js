import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { KbCategory } from '../../containers';

const propTypes = {
  item: PropTypes.object.isRequired,
  topics: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
};

class KbCategoryRow extends Component {
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
    const { item, topics } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{item.title}</td>
        <td>{item.description}</td>
        <td />

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit category" trigger={editTrigger}>
              <KbCategory item={item} topics={topics} />
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

KbCategoryRow.propTypes = propTypes;

export default KbCategoryRow;
