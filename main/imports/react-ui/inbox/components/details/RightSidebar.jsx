import React, { PropTypes } from 'react';
import { NameCard } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  conversation: PropTypes.object.isRequired,
};

function RightSidebar({ conversation }) {
  const customer = conversation.customer();

  const renderTwitterData = () => {
    if (customer.source === 'twitter') {
      return (
        <li><img src={customer.twitterData.profileImageUrl} /></li>
      );
    }

    return null;
  };

  const renderInAppMessagingData = () => {
    if (customer.source === 'in_app_messaging') {
      return customer.getInAppMessagingCustomData().map((data, index) => (
        <li key={index}>
          <span className="capitalize">{data.name}</span>
          <span className="counter">{data.value}</span>
        </li>
      ));
    }

    return null;
  };

  return (
    <Wrapper.Sidebar size="wide">
      <Wrapper.Sidebar.Section>
        <h3>Customer details</h3>
        <ul className="filters no-link">
          <li>
            <NameCard customer={customer} avatarSize={50} />
          </li>

          {renderInAppMessagingData()}
          {renderTwitterData()}
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
