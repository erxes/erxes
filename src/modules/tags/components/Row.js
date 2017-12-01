/* eslint-env browser */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Tags,
  ModalTrigger,
  Tip,
  ActionButtons,
  Button,
  Icon
} from 'modules/common/components';
import Form from './Form';

const propTypes = {
  tag: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  count: PropTypes.number,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

function Row({ tag, type, count, remove, save }) {
  function removeTag() {
    remove(tag);
  }

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text="Edit">
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  return (
    <tr>
      <td>
        <Tags tags={[tag]} size="medium" />
      </td>
      <td>{count}</td>
      <td>
        <ActionButtons>
          <ModalTrigger title="Edit response" trigger={editTrigger}>
            <Form type={type} tag={tag} save={save} />
          </ModalTrigger>

          <Tip text="Delete">
            <Button btnStyle="link" onClick={removeTag}>
              <Icon icon="close-circled" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

Row.propTypes = propTypes;

export default Row;
