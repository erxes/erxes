import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import LoadMore from 'modules/common/components/LoadMore';
import { __ } from 'modules/common/utils';
import ConversationItem from 'modules/inbox/containers/leftSidebar/ConversationItem';
import React from 'react';
import { IConversation } from '../../types';
import { IntegrationModal } from './IntegrationModal';
import { ConversationItems } from './styles';

type Props = {
  conversations: IConversation[];
  currentConversationId?: string;
  selectedConversations?: IConversation[];
  onChangeConversation: (conversation: IConversation) => void;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  loading: boolean;
  totalCount: number;
};

export default class ConversationList extends React.Component<Props> {
  render() {
    const {
      conversations,
      currentConversationId,
      selectedConversations,
      onChangeConversation,
      toggleRowCheckbox,
      loading,
      totalCount
    } = this.props;

    const popupTrigger = (
      <Button icon="processor">{__('Connect Integration')}</Button>
    );

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
            extra={<IntegrationModal trigger={popupTrigger} />}
          />
        )}

        <LoadMore all={totalCount} perPage={10} loading={loading} />
      </React.Fragment>
    );
  }
}
