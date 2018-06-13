import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { LoadMore, EmptyState } from 'modules/common/components';
import ConversationList from './conversationList';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  onChangeConversation: PropTypes.func.isRequired,
  toggleRowCheckbox: PropTypes.func.isRequired,
  selectedIds: PropTypes.array
};

class Content extends React.Component {
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
        <ConversationList
          conversations={conversations}
          onRowClick={onChangeConversation}
          toggleRowCheckbox={toggleRowCheckbox}
          selectedIds={selectedIds}
          currentConversationId={currentConversationId}
        />
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

Content.propTypes = propTypes;

export default Content;
