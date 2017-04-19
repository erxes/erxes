import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { NameCard } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  conversation: PropTypes.object.isRequired,
};

function RightSidebar({ conversation }) {
  const customer = conversation.customer();
  const integration = conversation.integration();

  const renderTwitterData = () => {
    if (integration.kind === 'twitter') {
      return <img src={customer.twitterData.profileImageUrl} />;
    }

    return null;
  };

  const renderInAppMessagingData = () => {
    if (integration.kind === 'in_app_messaging') {
      return customer.getInAppMessagingCustomData().map((data, index) => (
        <li key={index}>
          <span className="capitalize">{data.name}</span>
          <span className="counter">{data.value}</span>
        </li>
      ));
    }

    return null;
  };

  const renderFacebookData = () => {
    if (integration.kind === 'facebook') {
      const link = `http://facebook.com/${conversation.facebookData.senderId}`;
      return (
        <li>
          <span className="capitalize">Facebook profile</span>
          <span className="counter">
            <a target="_blank" href={link}>[view]</a>
          </span>
        </li>
      );
    }

    return null;
  };

  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar size="wide">
      <Wrapper.Sidebar.Section>
        <Title>Customer details</Title>
        <ul className="filters no-link">
          <li>
            <NameCard customer={customer} avatarSize={50} />
            {renderTwitterData()}
          </li>

          {renderInAppMessagingData()}
          {renderFacebookData()}
        </ul>
        <div className="box">
          <Button
            href={FlowRouter.path('customers/details', {
              id: customer && customer._id,
            })}
            className="action-btn btn-sm"
          >
            View customer profile
          </Button>
        </div>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
