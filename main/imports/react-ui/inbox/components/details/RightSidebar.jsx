import React, { PropTypes } from 'react';
import { NameCard } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  conversation: PropTypes.object.isRequired,
};

function RightSidebar({ conversation }) {
  const customer = conversation.customer();

  return (
    <Wrapper.Sidebar size="wide">
      <Wrapper.Sidebar.Section>
        <h3>Customer details</h3>
        <ul className="filters no-link">
          <li>
            <NameCard customer={customer} avatarSize={50} />
          </li>

          {customer.getInAppMessagingCustomData().map((data, index) => (
            <li key={index}>
              <span className="capitalize">{data.name}</span>
              <span className="counter">{data.value}</span>
            </li>
          ))}
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
