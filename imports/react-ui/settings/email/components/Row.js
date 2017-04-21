import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Tip, ActionButtons, ModalTrigger } from '/imports/react-ui/common';
import { Config } from '../containers';

const propTypes = {
  brand: PropTypes.shape({
    _id: PropTypes.string,
    code: PropTypes.string,
    name: PropTypes.string,
    emailConfig: PropTypes.object,
  }),
};

function Row({ brand }) {
  const { name, _id } = brand;
  const emailConfig = brand.emailConfig || { type: 'simple' };

  const editTrigger = (
    <Button bsStyle="link">
      <Tip text="Edit"><i className="ion-edit" /></Tip>
    </Button>
  );

  const title = `${name}'s email template`;

  return (
    <tr>
      <td>{name}</td>
      <td>{emailConfig.type}</td>
      <td className="text-right">
        <ActionButtons>
          <ModalTrigger title={title} trigger={editTrigger}>
            <Config brandId={_id} />
          </ModalTrigger>
        </ActionButtons>
      </td>
    </tr>
  );
}

Row.propTypes = propTypes;

export default Row;
