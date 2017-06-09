import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  customer: PropTypes.object.isRequired,
};

function TwitterSection({ customer }) {
  const { twitterData } = customer;

  if (!twitterData) {
    return null;
  }

  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Twitter</Title>
      <ul className="sidebar-list no-link">
        <li>
          Name
          <span className="counter">{twitterData.name}</span>
        </li>
        <li>
          Screen name
          <span className="counter">{twitterData.screenName}</span>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

TwitterSection.propTypes = propTypes;

export default TwitterSection;
