import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
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
      <SidebarList className="no-link">
        <li>
          Name
          <SidebarCounter>{twitterData.name}</SidebarCounter>
        </li>
        <li>
          Screen name
          <SidebarCounter>{twitterData.screenName}</SidebarCounter>
        </li>
      </SidebarList>
    </Wrapper.Sidebar.Section>
  );
}

TwitterSection.propTypes = propTypes;

export default TwitterSection;
