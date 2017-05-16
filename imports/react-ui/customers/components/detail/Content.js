import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ConversationsList, EmptyState } from '/imports/react-ui/common';

const propTypes = {
  conversations: PropTypes.array.isRequired,
};

function Content({ conversations }) {
  return (
    <div>
      {conversations.length
        ? <ConversationsList conversations={conversations} user={Meteor.user()} />
        : <EmptyState
            text="There aren’t any conversations at the moment."
            size="full"
            icon={<i className="ion-email" />}
          />}
    </div>
  );
}

Content.propTypes = propTypes;

export default Content;
