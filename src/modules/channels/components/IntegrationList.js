import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Row } from '/';
import { IntegrationForm, Sidebar } from '../containers';
import {
  Table,
  Pagination,
  ModalTrigger,
  Button,
  Icon,
  ShowData
} from 'modules/common/components';

const propTypes = {
  allIntegrationsQuery: PropTypes.object.isRequired,
  integrations: PropTypes.array.isRequired,
  channelDetail: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
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
    return <Row {...props} />;
  }

  renderForm(props) {
    return <IntegrationForm {...props} />;
  }

  render() {
    const {
      loading,
      totalCount,
      integrations,
      channelDetail,
      refetch,
      allIntegrationsQuery,
      save
    } = this.props;
    const breadcrumb = [{ title: `Channels` }];

    const trigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="wrench" /> Manage integration
      </Button>
    );

    const rightActionBar = (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        {this.renderForm({
          integrations,
          channelDetail,
          allIntegrationsQuery,
          refetch,
          save
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
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        footer={<Pagination count={totalCount} />}
        content={
          <ShowData
            data={content}
            loading={loading}
            count={totalCount}
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
