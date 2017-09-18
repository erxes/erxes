import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import { ActionButtons } from '../';
import Sidebar from '../../../Sidebar';

const propTypes = {
  items: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class CommonList extends React.Component {
  constructor(props) {
    super(props);

    this.renderItems = this.renderItems.bind(this);
    this.getActionBar = this.getActionBar.bind(this);
    this.getContent = this.getContent.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.render = this.render.bind(this);
  }

  renderItems() {
    return null;
  }

  getActionBar() {
    return <Wrapper.ActionBar left={<ActionButtons />} />;
  }

  getContent() {
    const { loadMore, hasMore } = this.props;

    return (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th width="183" className="text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {this.renderItems()}
          </tbody>
        </Table>
      </Pagination>
    );
  }

  getHeader() {
    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    return <Wrapper.Header breadcrumb={breadcrumb} />;
  }

  render() {
    return (
      <div>
        <Wrapper
          header={this.getHeader()}
          leftSidebar={<Sidebar />}
          actionBar={this.getActionBar()}
          content={this.getContent()}
        />
      </div>
    );
  }
}

CommonList.propTypes = propTypes;

export default CommonList;
