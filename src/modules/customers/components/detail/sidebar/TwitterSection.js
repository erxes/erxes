import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function TwitterSection({ customer }, { __ }) {
  const { twitterData } = customer;

  if (!twitterData) {
    return null;
  }

  const { Title } = Sidebar.Section;

  return (
    <Sidebar.Section>
      <Title>{__('Twitter')}</Title>
      <SidebarList className="no-link">
        <li>
          {__('Name')}
          <SidebarCounter>{twitterData.name}</SidebarCounter>
        </li>
        <li>
          {__('Screen name')}
          <SidebarCounter>{twitterData.screenName}</SidebarCounter>
        </li>
      </SidebarList>
    </Sidebar.Section>
  );
}

TwitterSection.propTypes = propTypes;
TwitterSection.contextTypes = {
  __: PropTypes.func
};

export default TwitterSection;
