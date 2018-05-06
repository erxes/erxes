import React from 'react';
import PropTypes from 'prop-types';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { BaseSection } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }, { __ }) {
  const { facebookData } = customer;

  if (!facebookData) {
    return null;
  }

  const content = (
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
  );

  return (
    <BaseSection
      title={__('Facebook')}
      content={content}
      isUseCustomer={true}
    />
  );
}

FacebookSection.propTypes = propTypes;
FacebookSection.contextTypes = {
  __: PropTypes.func
};

export default FacebookSection;
