import React from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import Content from './Content';
import Sidebar from './sidebar/Sidebar';
import RightSidebar from './RightSidebar';

const propTypes = {
  customer: PropTypes.object.isRequired,
  conversations: PropTypes.array.isRequired,
};

function Details({ customer, conversations }) {
  const breadcrumb = [
    { title: 'Customers', link: FlowRouter.path('customers/list') },
    { title: customer.name },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar customer={customer} />}
        content={<Content conversations={conversations} />}
        rightSidebar={<RightSidebar customerId={customer._id} />}
      />
    </div>
  );
}

Details.propTypes = propTypes;

export default Details;
