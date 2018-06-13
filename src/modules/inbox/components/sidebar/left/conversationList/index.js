import React from 'react';
import PropTypes from 'prop-types';
import ListRow from './Row';
import { ConversationItems } from './styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  toggleRowCheckbox: PropTypes.func,
  selectedIds: PropTypes.array,
  onRowClick: PropTypes.func,
  currentConversationId: PropTypes.string
};

function ConversationList(props, context) {
  const {
    conversations,
    toggleRowCheckbox,
    selectedIds,
    onRowClick,
    currentConversationId
  } = props;

  const { currentUser } = context;

  const starredConversationIds =
    currentUser.details.starredConversationIds || [];

  return (
    <ConversationItems id="conversations">
      {conversations.map(c => (
        <ListRow
          key={c._id}
          conversation={c}
          isRead={c.readUserIds && c.readUserIds.indexOf(currentUser._id) > -1}
          starred={starredConversationIds.indexOf(c._id) !== -1}
          isActive={currentConversationId === c._id}
          isParticipated={
            !!c.participatedUserIds &&
            c.participatedUserIds.indexOf(currentUser._id) > -1
          }
          toggleCheckbox={toggleRowCheckbox}
          onClick={onRowClick}
          selectedIds={selectedIds}
          currentConversationId={currentConversationId}
        />
      ))}
    </ConversationItems>
  );
}

ConversationList.propTypes = propTypes;

ConversationList.contextTypes = {
  currentUser: PropTypes.object
};

export default ConversationList;
