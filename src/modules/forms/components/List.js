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
  integrationsCount: PropTypes.number.isRequired,
  loading: PropTypes.bool
};

class List extends Component {
  renderRow() {
    const { integrations } = this.props;

    return integrations.map(integration => (
      <Row key={integration._id} integration={integration} />
    ));
  }

  render() {
    const { integrationsCount, loading } = this.props;

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
            <th>Name</th>
            <th>Views</th>
            <th>Conversion rate</th>
            <th>Contacts gathered</th>
            <th>Created at</th>
            <th width="5%" />
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Forms' }]} />}
        actionBar={<Wrapper.ActionBar right={actionBarRight} />}
        footer={<Pagination count={integrationsCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={integrationsCount}
            emptyText="There is no forms."
            emptyImage="/images/robots/robot-03.svg"
          />
        }
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
