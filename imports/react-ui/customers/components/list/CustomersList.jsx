import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from './Sidebar.jsx';
import CustomerRow from './CustomerRow.jsx';


const propTypes = {
  customers: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

function CustomersList({ customers, brands, integrations, tags, loadMore, hasMore }) {
  const content = (
    <Pagination hasMore={hasMore} loadMore={loadMore}>
      <Table className="no-wrap">
        <thead>
          <tr>
            <th className="less-space" />
            <th>Name</th>
            <th>Email</th>
            <th>Brand</th>
            <th>Integration</th>
            <th>Last online</th>
            <th>Session count</th>
          </tr>
        </thead>
        <tbody>
          {
            customers.map(customer =>
              <CustomerRow customer={customer} key={customer._id} />,
            )
          }
        </tbody>
      </Table>
    </Pagination>
  );

  const breadcrumb = [{ title: `Customers (${Counts.get('customers.list.count')})` }];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar
            brands={brands}
            integrations={integrations}
            tags={tags}
          />
        }
        content={content}
      />
    </div>
  );
}

CustomersList.propTypes = propTypes;

export default CustomersList;
