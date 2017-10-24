/* eslint-env browser */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import {
  Tags,
  ModalTrigger,
  Tip,
  ActionButtons
} from 'modules/common/components';
import Form from './Form';

const propTypes = {
  tag: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

function Row({ tag, type, remove, save }) {
  function removeTag() {
    remove(tag);
  }

  const editTrigger = (
    <Button bsStyle="link">
      <Tip text="Edit">
        <i className="ion-edit" />
      </Tip>
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
            <Form type={type} tag={tag} save={save} />
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
