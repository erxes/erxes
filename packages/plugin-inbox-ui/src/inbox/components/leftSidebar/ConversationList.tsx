import Button from '@erxes/ui/src/components/Button';
import ConversationItem from '../../containers/leftSidebar/ConversationItem';
import { ConversationItems } from './styles';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  conversations: IConversation[];
  currentConversationId?: string;
  selectedConversations?: IConversation[];
  onChangeConversation: (conversation: IConversation) => void;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  loading: boolean;
  totalCount: number;
  onLoadMore: (skip: number) => void;
};

export default class ConversationList extends React.Component<Props> {
  onLoadMore = () => {
    const { conversations, onLoadMore } = this.props;

    onLoadMore(conversations.length);
  };

  render() {
    const {
      conversations,
      currentConversationId,
      selectedConversations,
      onChangeConversation,
      toggleRowCheckbox,
      loading,
      totalCount,
      onLoadMore
    } = this.props;
    console.log('ccccc', conversations);

    return (
      <React.Fragment>
        <ConversationItems id="conversations">
          {conversations.map(conv => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              toggleCheckbox={toggleRowCheckbox}
              onClick={onChangeConversation}
              selectedIds={(selectedConversations || []).map(
                conversation => conversation._id
              )}
              currentConversationId={currentConversationId}
            />
          ))}
        </ConversationItems>

        {!loading && conversations.length === 0 && (
          <EmptyState
            text="Let's get you messaging away!"
            size="full"
            image="/images/actions/6.svg"
          />
        )}

        <Button
          block={true}
          btnStyle="link"
          onClick={this.onLoadMore}
          icon="redo"
          uppercase={false}
        >
          {loading ? 'Loading...' : 'Load more'}
        </Button>

        {/* <LoadMore
          all={totalCount}
          perPage={10}
          loading={loading}
          length={conversations.length}
          fetchMore={fetchMore}
        /> */}
      </React.Fragment>
    );
  }
}
