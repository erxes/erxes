import React from 'react';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '/imports/react-ui/common';
import { KbArticle } from '../containers';

function ActionButtons() {
  const triggerKbArticle = (
    <Button bsStyle="link">
      <i className="ion-plus-circled" /> Add Article
    </Button>
  );

  return (
    <div>
      <ModalTrigger title="Add article" trigger={triggerKbArticle}>
        <KbArticle />
      </ModalTrigger>
    </div>
  );
}

export default ActionButtons;
