import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { LoadMore, EmptyState } from 'modules/common/components';
import { ConversationItem } from 'modules/inbox/containers/leftSidebar';
import { ConversationItems } from './styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  toggleRowCheckbox: PropTypes.func.isRequired,
  selectedIds: PropTypes.array
};

export default class ConversationList extends React.Component {
  render() {
    const {
      conversations,
      currentConversationId,
      selectedIds,
      onChangeConversation,
      toggleRowCheckbox,
      loading,
      totalCount
    } = this.props;

    const { currentUser } = this.context;

    const starredConversationIds =
      currentUser.details.starredConversationIds || [];

    return (
      <Fragment>
        <ConversationItems id="conversations">
          {conversations.map(c => (
            <ConversationItem
              key={c._id}
              conversation={c}
              isRead={
                c.readUserIds && c.readUserIds.indexOf(currentUser._id) > -1
              }
              starred={starredConversationIds.indexOf(c._id) !== -1}
              isActive={currentConversationId === c._id}
              isParticipated={
                !!c.participatedUserIds &&
                c.participatedUserIds.indexOf(currentUser._id) > -1
              }
              toggleCheckbox={toggleRowCheckbox}
              onClick={onChangeConversation}
              selectedIds={selectedIds}
              currentConversationId={currentConversationId}
            />
          ))}
        </ConversationItems>
        {!loading &&
          conversations.length === 0 && (
            <EmptyState
              text="There is no message."
              size="full"
              image="/images/robots/robot-02.svg"
            />
          )}
        <LoadMore all={totalCount} loading={loading} />
      </Fragment>
    );
  }
}

ConversationList.propTypes = propTypes;

ConversationList.contextTypes = {
  currentUser: PropTypes.object
};
