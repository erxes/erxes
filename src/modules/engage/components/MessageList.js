import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { Pagination } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import {
  DropdownToggle,
  TaggerPopover,
  Table,
  Button,
  Icon,
  EmptyState
} from 'modules/common/components';
import { MessageListRow, Sidebar as SidebarContainers } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired
};

class List extends React.Component {
  renderTagger() {
    const { bulk, emptyBulk } = this.props;

    const tagButton = (
      <Button btnStyle="simple" size="small">
        Tag <Icon icon="ios-arrow-down" />
      </Button>
    );

    if (bulk.length) {
      return (
        <TaggerPopover
          type="engageMessage"
          targets={bulk}
          trigger={tagButton}
          afterSave={emptyBulk}
        />
      );
    }
  }

  render() {
    const { messages, totalCount, tags, toggleBulk, refetch } = this.props;

    const actionBarRight = (
      <Dropdown id="dropdown-engage" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="success" size="small">
            <Icon icon="plus" /> New message <Icon icon="chevron-down" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <li>
            <Link to={'/engage/messages/create?kind=auto'}>Auto message</Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=manual'}>
              Manual message
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=visitorAuto'}>
              Visitor auto message
            </Link>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    );

    const actionBar = (
      <Wrapper.ActionBar left={this.renderTagger()} right={actionBarRight} />
    );

    const emptyContent = (
      <EmptyState text="There is no engage message." size="full" icon="email" />
    );

    const mainContent = (
      <div>
        <Table whiteSpace="nowrap" hover bordered>
          <thead>
            <tr>
              <th />
              <th>Title</th>
              <th>From</th>
              <th>Status</th>
              <th>Total</th>
              <th>Sent</th>
              <th>Failed</th>
              <th>Type</th>
              <th>Created date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(message => (
              <MessageListRow
                toggleBulk={toggleBulk}
                refetch={refetch}
                key={message._id}
                message={message}
              />
            ))}
          </tbody>
        </Table>

        <Pagination count={totalCount} />
      </div>
    );

    const content = () => {
      if (messages.length === 0) {
        return emptyContent;
      }
      return mainContent;
    };

    const sidebar = (
      <Wrapper.Sidebar>
        <SidebarContainers.Main />
        <SidebarContainers.Status />
        <SidebarContainers.Tag tags={tags} manageUrl="tags/engageMessage" />
      </Wrapper.Sidebar>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Engage' }]} />}
        leftSidebar={sidebar}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={content()}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
