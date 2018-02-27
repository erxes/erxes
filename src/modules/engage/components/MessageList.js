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
  DataWithLoader,
  ModalTrigger
} from 'modules/common/components';
import { ManageColumns } from 'modules/fields/containers';
import { MessageListRow, Sidebar as SidebarContainers } from '../containers';
import { BarItems } from 'modules/layout/styles';

const propTypes = {
  columnsConfig: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object,
  location: PropTypes.object
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
      loading,
      columnsConfig,
      history,
      location
    } = this.props;

    const newEngagementButton = (
      <Link to={'/engage/messages/create'}>
        <Button btnStyle="success" size="small" icon="plus">
          New engagement
        </Button>
      </Link>
    );

    const editColumns = (
      <Button btnStyle="simple" size="small">
        Edit columns
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <ModalTrigger title="Choose which column you see" trigger={editColumns}>
          <ManageColumns
            contentType="engage"
            location={location}
            history={history}
          />
        </ModalTrigger>
        {newEngagementButton}
      </BarItems>
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
              {columnsConfig.map(({ name, label }) => (
                <th key={name}>{label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(message => (
              <MessageListRow
                columnsConfig={columnsConfig}
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
