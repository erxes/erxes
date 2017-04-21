import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { ConversationsList, EmptyState } from '/imports/react-ui/common';

const propTypes = {
  conversations: PropTypes.array.isRequired,
};

function Content({ conversations }) {
  return (
    <Tabs defaultActiveKey={1} id="customers-content-tab">
      <Tab eventKey={1} title="Conversations">
        {conversations.length
          ? <ConversationsList conversations={conversations} user={Meteor.user()} />
          : <EmptyState
              text="There aren’t any conversations at the moment."
              size="full"
              icon={<i className="ion-email" />}
            />}

      </Tab>
      <Tab eventKey={2} title="Internal notes">
        <EmptyState
          icon={<i className="ion-document-text" />}
          text="No internal notes"
          size="full"
        />
      </Tab>
    </Tabs>
  );
}

Content.propTypes = propTypes;

export default Content;
