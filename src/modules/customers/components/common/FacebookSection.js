import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }, { __, queryParams }) {
  const { Section } = Sidebar;
  const { Title } = Section;

  const { facebookData } = customer;

  if (!(facebookData || queryParams)) {
    return null;
  }

  return (
    <Section>
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
    </Section>
  );
}

FacebookSection.propTypes = propTypes;
FacebookSection.contextTypes = {
  __: PropTypes.func,
  queryParams: PropTypes.object
};

export default FacebookSection;
