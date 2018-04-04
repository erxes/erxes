import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Button,
  Table,
  Pagination,
  DataWithLoader
} from 'modules/common/components';
import { Row } from '/';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  tags: PropTypes.array,
  integrationsCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  remove: PropTypes.func
};

class List extends Component {
  renderRow() {
    const { integrations, members, remove } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        integration={integration}
        members={members}
        remove={remove}
      />
    ));
  }

  render() {
    const { integrationsCount, loading } = this.props;
    const { __ } = this.context;

    const actionBarRight = (
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="plus">
          Create form
        </Button>
      </Link>
    );

    const content = (
      <Table hover>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Brand')}</th>
            <th>{__('Views')}</th>
            <th>{__('Conversion rate')}</th>
            <th>{__('Contacts gathered')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Tags')}</th>
            <th />
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const sidebar = (
      <Wrapper.Sidebar>
        <div>Tags</div>
      </Wrapper.Sidebar>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: __('Forms') }]} />}
        leftSidebar={sidebar}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        footer={<Pagination count={integrationsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={integrationsCount}
            emptyText="There is no form."
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
