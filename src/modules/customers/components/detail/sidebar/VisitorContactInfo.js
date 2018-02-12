import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function VisitorContactInfo({ customer }) {
  const { visitorContactInfo } = customer;

  if (!visitorContactInfo) {
    return null;
  }

  const { Title } = Sidebar.Section;

  return (
    <Sidebar.Section>
      <Title>Visitor contact info</Title>
      <SidebarList className="no-link">
        <li>
          Email
          <SidebarCounter>{visitorContactInfo.email}</SidebarCounter>
        </li>
        <li>
          Phone
          <SidebarCounter>{visitorContactInfo.phone}</SidebarCounter>
        </li>
      </SidebarList>
    </Sidebar.Section>
  );
}

VisitorContactInfo.propTypes = propTypes;

export default VisitorContactInfo;
