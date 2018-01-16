import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { IntegrationRow } from '/';
import { IntegrationForm, Sidebar } from '../containers';
import {
  Table,
  Pagination,
  ModalTrigger,
  Button,
  DataWithLoader
} from 'modules/common/components';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  channelDetail: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired,
  integrationsTotalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool
};

class IntegrationList extends Component {
  renderObjects() {
    const { integrations, refetch } = this.props;

    return integrations.map(integration =>
      this.renderRow({
        key: integration._id,
        integration,
        refetch
      })
    );
  }

  renderRow(props) {
    return <IntegrationRow {...props} />;
  }

  renderForm(props) {
    return <IntegrationForm {...props} />;
  }

  render() {
    const {
      loading,
      integrationsTotalCount,
      integrations,
      channelDetail,
      channels,
      refetch
    } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Channels', link: '/settings/channels' },
      { title: `${channelDetail.name || ''}` }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="wrench">
        Manage integration
      </Button>
    );

    const rightActionBar = (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        {this.renderForm({
          integrations,
          channelDetail,
          refetch
        })}
      </ModalTrigger>
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
        leftSidebar={
          <Sidebar channels={channels} refetch={refetch} loading={loading} />
        }
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        footer={<Pagination count={integrationsTotalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={integrationsTotalCount}
            emptyText="There is no integration in this channel"
            emptyIcon="email"
          />
        }
      />
    );
  }
}

IntegrationList.propTypes = propTypes;

export default IntegrationList;
