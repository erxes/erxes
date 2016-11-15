import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { TaggerPopover, EmptyState } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Resolver } from '../../containers';
import Sidebar from './Sidebar.jsx';
import ListRow from './Row.jsx';


const propTypes = {
  tickets: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  starredTicketIds: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  channelId: PropTypes.string,
  userId: PropTypes.string,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
};

function List(props) {
  const {
    tickets,
    channels,
    starredTicketIds,
    tags,
    channelId,
    brands,
    userId,
    bulk,
    toggleBulk,
    emptyBulk,
  } = props;

  /**
   * There must be only ticket ids in the 'bulk'
   * because we can't update its content when tickets are reactively changed.
   *
   * TODO: Pass this targets array to the 'Resolver' component and
   * find tickets by those ids on component
   */
  const targets = bulk.map(b => b._id);

  const actionBarLeft = (
    <div>
      <Resolver
        tickets={bulk}
        afterSave={emptyBulk}
      />

      <TaggerPopover
        type="ticket"
        targets={targets}
        trigger={
          <Button bsStyle="link">
            <i className="ion-pricetags"></i>
            Tag ticket <span className="caret"></span>
          </Button>
        }
        afterSave={emptyBulk}
      />
    </div>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

  const content = (
    <ul className="tickets-list">
      {
        tickets.map(ticket =>
          <ListRow
            starred={starredTicketIds.indexOf(ticket._id) !== -1}
            ticket={ticket}
            key={ticket._id}
            toggleBulk={toggleBulk}
            channelId={channelId}
            isParticipate={
              ticket.participatedUserIds && ticket.participatedUserIds.indexOf(userId) > -1
            }
            isRead={ticket.readUserIds && ticket.readUserIds.indexOf(userId) > -1}
          />
        )
      }
    </ul>
  );

  const empty = (
    <EmptyState
      text="No ticket"
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
        content={tickets.length !== 0 ? content : empty}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
