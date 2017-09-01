import React from 'react';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '/imports/react-ui/common';
import { KbTopic, KbCategory, KbArticle } from '../containers';

function ActionButtons() {
  const triggerKbTopic = (
    <Button bsStyle="link">
      <i className="ion-plus-circled" /> Add Topic
    </Button>
  );

  const triggerKbCategory = (
    <Button bsStyle="link">
      <i className="ion-plus-circled" /> Add Category
    </Button>
  );

  const triggerKbArticle = (
    <Button bsStyle="link">
      <i className="ion-plus-circled" /> Add Article
    </Button>
  );

  return (
    <div>
      <ModalTrigger title="Add topic" trigger={triggerKbTopic}>
        <KbTopic />
      </ModalTrigger>

      <ModalTrigger title="Add category" trigger={triggerKbCategory}>
        <KbCategory />
      </ModalTrigger>

      <ModalTrigger title="Add article" trigger={triggerKbArticle}>
        <KbArticle />
      </ModalTrigger>
    </div>
  );
}

export default ActionButtons;
