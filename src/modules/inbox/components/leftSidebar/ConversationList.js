import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { LoadMore, EmptyState } from 'modules/common/components';
import { ConversationItem } from 'modules/inbox/containers/leftSidebar';
import { ConversationItems } from './styles';

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

    return (
      <Fragment>
        <ConversationItems id="conversations">
          {conversations.map(conv => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
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

        <LoadMore all={totalCount} perPage={10} loading={loading} />
      </Fragment>
    );
  }
}

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  toggleRowCheckbox: PropTypes.func.isRequired,
  selectedIds: PropTypes.array
};
