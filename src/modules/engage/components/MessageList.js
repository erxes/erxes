import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Pagination } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import {
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
  loading: PropTypes.bool.isRequired
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
      loading
    } = this.props;

    const actionBarRight = (
      <Link to={'/engage/messages/create?'}>
        <Button btnStyle="success" size="small" icon="plus">
          New engagement
        </Button>
      </Link>
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
              <th>Title</th>
              <th>From</th>
              <th>Status</th>
              <th>Total</th>
              <th>Sent</th>
              <th>Failed</th>
              <th>Type</th>
              <th>Created date</th>
              <th>Tags</th>
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
        header={<Wrapper.Header breadcrumb={[{ title: 'Engage' }]} />}
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

export default List;
