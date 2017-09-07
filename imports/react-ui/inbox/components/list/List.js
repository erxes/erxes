import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Pagination, TaggerPopover, EmptyState, ConversationsList } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { AssignBoxPopover } from '../';
import { Resolver, Sidebar } from '../../containers';

const propTypes = {
  readConversations: PropTypes.array.isRequired,
  unreadConversations: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  channelId: PropTypes.string,
  user: PropTypes.object,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
};

function List(props) {
  const {
    readConversations,
    unreadConversations,
    hasMore,
    loadMore,
    channelId,
    user,
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
      <Resolver conversations={bulk} afterSave={emptyBulk} />

      <TaggerPopover
        type="conversation"
        targets={targets}
        trigger={
          <Button bsStyle="link">
            <i className="ion-pricetags" /> Tag <span className="caret" />
          </Button>
        }
        afterSave={emptyBulk}
      />

      <AssignBoxPopover
        targets={targets}
        trigger={
          <Button bsStyle="link">
            <i className="ion-person" /> Assign <span className="caret" />
          </Button>
        }
        afterSave={emptyBulk}
      />
    </div>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

  const renderUnreadConversations = (
    <ConversationsList
      conversations={unreadConversations}
      user={user}
      channelId={channelId}
      toggleBulk={toggleBulk}
    />
  );

  const renderReadConversations = (
    <ConversationsList
      conversations={readConversations}
      user={user}
      channelId={channelId}
      toggleBulk={toggleBulk}
    />
  );

  const content = (
    <Pagination hasMore={hasMore} loadMore={loadMore}>
      {renderUnreadConversations}
      {renderReadConversations}
    </Pagination>
  );

  const empty = (
    <EmptyState
      text="There aren’t any conversations at the moment."
      size="full"
      icon={<i className="ion-email" />}
    />
  );

  const mainContent = () => {
    if (unreadConversations.length === 0 && readConversations.length === 0) {
      return empty;
    }

    return content;
  };

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Inbox' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={bulk.length ? actionBar : false}
        content={mainContent()}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
