import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }) {
  const { facebookData } = customer;

  if (!facebookData) {
    return null;
  }

  const { Title } = Sidebar.Section;

  return (
    <Sidebar.Section>
      <Title>Facebook</Title>
      <SidebarList className="no-link">
        <li>
          Facebook profile
          <SidebarCounter>
            <a
              target="_blank"
              href={`http://facebook.com/${facebookData.id}`}
              rel="noopener noreferrer"
            >
              [view]
            </a>
          </SidebarCounter>
        </li>
      </SidebarList>
    </Sidebar.Section>
  );
}

FacebookSection.propTypes = propTypes;

export default FacebookSection;
