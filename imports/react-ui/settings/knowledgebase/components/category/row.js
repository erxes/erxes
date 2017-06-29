import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';

const propTypes = {
  item: PropTypes.object.isRequired,
  removeItem: PropTypes.func.isRequired,
};

class CategoryRow extends Component {
  constructor(props) {
    super(props);

    this.removeItem = this.removeItem.bind(this);
  }

  removeItem() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { item, removeItem } = this.props;

    removeItem(item._id, error => {
      if (error) {
        return Alert.error("Can't delete a integration", error.reason);
      }

      return Alert.success('Congrats', 'Integration has deleted.');
    });
  }

  renderExtraLinks() {
    const item = this.props.item;
    const kind = item.kind;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return null;
  }

  render() {
    const item = this.props.item;

    return (
      <tr>
        <td>{item.name}</td>
        <td />
        <td />

        <td className="text-right">
          <ActionButtons>
            {this.renderExtraLinks()}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeItem}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

CategoryRow.propTypes = propTypes;

export default CategoryRow;
