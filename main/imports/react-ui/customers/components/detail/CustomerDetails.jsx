import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar.jsx';
import RightSidebar from './RightSidebar.jsx';


const propTypes = {
  customer: PropTypes.object.isRequired,
};

function Details({ customer }) {
  console.log(customer);
  const breadcrumb = [
    { title: 'Customers', link: FlowRouter.path('customers/list') },
    { title: customer.name },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar customer={customer} />
        }
        content={<div>content</div>}
        rightSidebar={<RightSidebar />}
      />
    </div>
  );
}

Details.propTypes = propTypes;

export default Details;
