import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Pagination, Button, Icon } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { Sidebar, Row, RightActionBar } from '/';

const propTypes = {
  objects: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  selectedMembers: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired
};

class ChannelList extends Component {
  renderObjects() {
    const { integrations, remove, save, refetch } = this.props;

    return integrations.map(integration =>
      this.renderRow({
        key: integration._id,
        integration,
        remove,
        refetch,
        save
      })
    );
  }

  renderRow(props) {
    return <Row {...props} />;
  }

  render() {
    const { totalCount } = this.props;
    const breadcrumb = [{ title: `Channel` }];

    const leftActionBar = (
      <Button btnStyle="danger" size="small">
        <Icon icon="close" /> Delete
      </Button>
    );

    const content = (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Brand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar {...this.props} />}
        actionBar={
          <Wrapper.ActionBar right={<RightActionBar />} left={leftActionBar} />
        }
        footer={<Pagination count={totalCount} />}
        content={content}
      />
    );
  }
}

ChannelList.propTypes = propTypes;

export default ChannelList;
