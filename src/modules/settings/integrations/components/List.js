import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Pagination, Button, Icon, Table } from 'modules/common/components';
import Sidebar from '../../Sidebar';
import Row from './Row';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderIntegrations = this.renderIntegrations.bind(this);
  }

  renderIntegrations() {
    const { integrations, refetch, removeIntegration } = this.props;

    return integrations.map(integration => (
      <Row
        key={integration._id}
        integration={integration}
        refetch={refetch}
        removeIntegration={removeIntegration}
      />
    ));
  }

  render() {
    const { loadMore, hasMore } = this.props;

    const actionBarLeft = (
      <Button btnStyle="success" href="/settings/integrations/add">
        <Icon icon="plus-circled" /> Add integrations
      </Button>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Brand</th>
              <th width="183" className="text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{this.renderIntegrations()}</tbody>
        </Table>
      </Pagination>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
