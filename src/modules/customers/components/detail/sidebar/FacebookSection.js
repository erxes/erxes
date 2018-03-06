import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }, { __ }) {
  const { facebookData } = customer;

  if (!facebookData) {
    return null;
  }

  const { Title } = Sidebar.Section;

  return (
    <Sidebar.Section>
      <Title>{__('Facebook')}</Title>
      <SidebarList className="no-link">
        <li>
          {__('Facebook profile')}
          <SidebarCounter>
            <a
              target="_blank"
              href={`http://facebook.com/${facebookData.id}`}
              rel="noopener noreferrer"
            >
              {__('[view]')}
            </a>
          </SidebarCounter>
        </li>
      </SidebarList>
    </Sidebar.Section>
  );
}

FacebookSection.propTypes = propTypes;
FacebookSection.contextTypes = {
  __: PropTypes.func
};

export default FacebookSection;
