import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { TaggerPopover, EmptyState } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Resolver } from '../../containers';
import Sidebar from './Sidebar.jsx';
import ListRow from './Row.jsx';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  starredConversationIds: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  channelId: PropTypes.string,
  userId: PropTypes.string,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
};

function List(props) {
  const {
    conversations,
    channels,
    starredConversationIds,
    tags,
    channelId,
    brands,
    userId,
    bulk,
    toggleBulk,
    emptyBulk,
  } = props;

  /**
   * There must be only conversation ids in the 'bulk'
   * because we can't update its content when conversations are reactively changed.
   *
   * TODO: Pass this targets array to the 'Resolver' component and
   * find conversations by those ids on component
   */
  const targets = bulk.map(b => b._id);

  const actionBarLeft = (
    <div>
      <Resolver
        conversations={bulk}
        afterSave={emptyBulk}
      />

      <TaggerPopover
        type="conversation"
        targets={targets}
        trigger={
          <Button bsStyle="link">
            <i className="ion-pricetags"></i>
            Tag conversation <span className="caret"></span>
          </Button>
        }
        afterSave={emptyBulk}
      />
    </div>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

  const content = (
    <ul className="conversations-list">
      {
        conversations.map(conversation =>
          <ListRow
            starred={starredConversationIds.indexOf(conversation._id) !== -1}
            conversation={conversation}
            key={conversation._id}
            toggleBulk={toggleBulk}
            channelId={channelId}
            isRead={conversation.readUserIds && conversation.readUserIds.indexOf(userId) > -1}
          />
        )
      }
    </ul>
  );

  const empty = (
    <EmptyState
      text="No conversation"
      size="full"
      icon={<i className="ion-email" />}
    />
  );

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Inbox' }]} />}
        leftSidebar={<Sidebar channels={channels} brands={brands} tags={tags} />}
        actionBar={bulk.length ? actionBar : false}
        content={conversations.length !== 0 ? content : empty}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
