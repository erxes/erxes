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
  DataWithLoader
} from 'modules/common/components';
import { MessageListRow, Sidebar as SidebarContainers } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  queryParams: PropTypes.object
};

class List extends React.Component {
  constructor(props) {
    super(props);

    this.afterTag = this.afterTag.bind(this);
  }

  afterTag() {
    this.props.emptyBulk();
    this.props.refetch();
  }

  renderTagger() {
    const { bulk } = this.props;
    const { __ } = this.context;

    const tagButton = (
      <Button btnStyle="simple" size="small">
        {__('Tag')} <Icon icon="ios-arrow-down" />
      </Button>
    );

    if (bulk.length) {
      return (
        <TaggerPopover
          type="engageMessage"
          targets={bulk}
          trigger={tagButton}
          afterSave={this.afterTag}
        />
      );
    }
  }

  render() {
    const {
      messages,
      totalCount,
      tags,
      toggleBulk,
      refetch,
      loading,
      queryParams
    } = this.props;
    const { __ } = this.context;

    const actionBarRight = (
      <Dropdown id="dropdown-engage" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="success" size="small" icon="plus">
            {__('New message')} <Icon erxes icon="downarrow" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <li>
            <Link to={'/engage/messages/create?kind=auto'}>
              {__('Auto message')}
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=manual'}>
              {__('Manual message')}
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=visitorAuto'}>
              {__('Visitor auto message')}
            </Link>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    );

    const actionBar = (
      <Wrapper.ActionBar left={this.renderTagger()} right={actionBarRight} />
    );

    const mainContent = (
      <div>
        <Table whiteSpace="nowrap" hover bordered>
          <thead>
            <tr>
              <th />
              <th>{__('Title')}</th>
              <th>{__('From')}</th>
              <th>{__('Status')}</th>
              <th>{__('Total')}</th>
              <th>{__('Sent')}</th>
              <th>{__('Delivered')}</th>
              <th>{__('Opened')}</th>
              <th>{__('Clicked')}</th>
              <th>{__('Complaint')}</th>
              <th>{__('Bounce')}</th>
              <th>{__('Rendering Failure')}</th>
              <th>{__('Rejected')}</th>
              <th>{__('Type')}</th>
              <th>{__('Brand')}</th>
              <th>{__('Created date')}</th>
              <th>{__('Tags')}</th>
              <th>{__('Actions')}</th>
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
      </div>
    );

    const sidebar = (
      <Wrapper.Sidebar>
        <SidebarContainers.Main />
        <SidebarContainers.Status />
        <SidebarContainers.Tag tags={tags} manageUrl="tags/engageMessage" />
      </Wrapper.Sidebar>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            breadcrumb={[{ title: __('Engage') }]}
            queryParams={queryParams}
          />
        }
        leftSidebar={sidebar}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={messages.length}
            emptyText="There is no engage message."
            emptyImage="/images/robots/robot-03.svg"
          />
        }
      />
    );
  }
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
