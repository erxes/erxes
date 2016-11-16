import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { Tags, ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { Form } from '../containers';


const propTypes = {
  tag: PropTypes.object.isRequired,
  remove: PropTypes.object.isRequired,
};

function Row({ tag, remove }) {
  function removeTag() {
    if (!confirm('Are you sure you want to delete this tag?')) { // eslint-disable-line no-alert
      return;
    }

    remove.call([tag._id], error => {
      if (error) {
        return Alert.error('Error', error.reason);
      }

      return Alert.success('Success', 'Successfully saved');
    });
  }

  const editTrigger = (
    <Button bsStyle="link">
      <Tip text="Edit"><i className="ion-edit" /></Tip>
    </Button>
  );

  return (
    <tr>
      <td>
        <Tags tags={[tag]} size="medium" />
      </td>
      <td className="text-right">
        <ActionButtons>
          <ModalTrigger title="Edit response" trigger={editTrigger}>
            <Form type="conversation" tag={tag} />
          </ModalTrigger>

          <Tip text="Delete">
            <Button bsStyle="link" onClick={removeTag}>
              <i className="ion-close-circled" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

Row.propTypes = propTypes;

export default Row;
