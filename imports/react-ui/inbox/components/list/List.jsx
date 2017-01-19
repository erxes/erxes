import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { TaggerPopover, EmptyState, ConversationsList } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { AssignBoxPopover } from '../';
import { Resolver } from '../../containers';
import Sidebar from './Sidebar.jsx';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  channelId: PropTypes.string,
  user: PropTypes.object,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
};

function List(props) {
  const {
    conversations,
    channels,
    tags,
    channelId,
    brands,
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
      <Resolver
        conversations={bulk}
        afterSave={emptyBulk}
      />

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

  const content = (
    <ConversationsList
      conversations={conversations}
      user={user}
      channelId={channelId}
      toggleBulk={toggleBulk}
    />
  );

  const empty = (
    <EmptyState
      text="There aren’t any conversations at the moment."
      size="full"
      icon={<i className="ion-email" />}
    />
  );

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Inbox' }]} />}

        leftSidebar={
          <Sidebar
            channels={channels}
            brands={brands}
            tags={tags}
          />
        }

        actionBar={bulk.length ? actionBar : false}
        content={conversations.length !== 0 ? content : empty}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
