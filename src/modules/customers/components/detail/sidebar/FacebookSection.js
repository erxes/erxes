import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }) {
  const { facebookData } = customer;

  if (!facebookData) {
    return null;
  }

  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Facebook</Title>
      <SidebarList className="no-link">
        <li>
          ID
          <SidebarCounter>{facebookData.id}</SidebarCounter>
        </li>
      </SidebarList>
    </Wrapper.Sidebar.Section>
  );
}

FacebookSection.propTypes = propTypes;

export default FacebookSection;
