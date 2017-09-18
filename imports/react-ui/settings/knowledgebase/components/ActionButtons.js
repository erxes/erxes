import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '/imports/react-ui/common';
import { NewKbTopic, KbCategory, KbArticle } from '../containers';

const propTypes = {
  topicListRefetch: PropTypes.func,
};

function ActionButtons(props) {
  const { topicListRefetch } = props;
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
        <NewKbTopic listRefetch={topicListRefetch} />
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

ActionButtons.propTypes = propTypes;

export default ActionButtons;
