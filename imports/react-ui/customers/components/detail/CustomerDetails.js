import React from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Sidebar } from '/imports/react-ui/customers/containers';
import Content from './Content';
import RightSidebar from './sidebar/RightSidebar';

const propTypes = {
  customer: PropTypes.object.isRequired,
  conversations: PropTypes.array.isRequired,
  queryParams: PropTypes.object.isRequired,
};

function Details({ customer, conversations, queryParams }) {
  const breadcrumb = [
    { title: 'Customers', link: FlowRouter.path('customers/list') },
    { title: customer.name || customer.email || 'N/A' },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar customer={customer} queryParams={queryParams} />}
        content={<Content conversations={conversations} />}
        rightSidebar={<RightSidebar customer={customer} />}
      />
    </div>
  );
}

Details.propTypes = propTypes;

export default Details;
