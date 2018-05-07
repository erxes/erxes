import React from 'react';
import PropTypes from 'prop-types';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { BaseSection } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function FacebookSection({ customer }, { __, queryParams }) {
  const { facebookData } = customer;

  if (!(facebookData || queryParams)) {
    return null;
  }

  const content = facebookData ? (
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
  ) : null;

  return (
    <BaseSection
      title={__('Facebook')}
      content={content}
      isUseCustomer={true}
      name="showFacebook"
    />
  );
}

FacebookSection.propTypes = propTypes;
FacebookSection.contextTypes = {
  __: PropTypes.func,
  queryParams: PropTypes.object
};

export default FacebookSection;
