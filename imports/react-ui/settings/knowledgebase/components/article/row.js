import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { KbArticle } from '../../containers';

const propTypes = {
  item: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
};

class KbArticleRow extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { item, removeItem } = this.props;

    removeItem(item._id, error => {
      if (error) {
        return Alert.error("Can't delete this article", error.reason);
      }

      return Alert.success('Congrats', 'Article has been deleted.');
    });
  }

  render() {
    const { item, categories } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{item.title}</td>
        <td>{item.summary}</td>
        <td>{item.category().title}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit article" trigger={editTrigger}>
              <KbArticle item={item} categories={categories} />
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

KbArticleRow.propTypes = propTypes;

export default KbArticleRow;
