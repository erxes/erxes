import React, { PropTypes } from 'react';
import Row from './Row.jsx';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';


const propTypes = {
  brands: PropTypes.array.isRequired,
};

function List({ brands }) {
  const content = (
    <Table>
      <thead>
        <tr>
          <th>Brand Name</th>
          <th>Current template</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {brands.map(brand =>
          <Row brand={brand} key={brand.code} />
        )}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: 'Settings', link: '/settings/channels' },
    { title: 'Email appearance' },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
