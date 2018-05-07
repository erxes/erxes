import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'modules/common/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { BaseSection } from 'modules/common/components';

const ButtonWrapper = styled.div`
  padding: 10px 20px;
`;

const propTypes = {
  customer: PropTypes.object.isRequired
};

function TwitterSection({ customer }, { __, queryParams }) {
  const { twitterData } = customer;

  if (!(twitterData || queryParams)) {
    return null;
  }

  const content = twitterData ? (
    <div>
      <SidebarList className="no-link">
        <li>
          {__('Name')}
          <SidebarCounter>{twitterData.name}</SidebarCounter>
        </li>
        <li>
          {__('Screen name')}
          <SidebarCounter>@{twitterData.screen_name}</SidebarCounter>
        </li>
      </SidebarList>
      <ButtonWrapper>
        <Button
          block
          btnStyle="primary"
          target="_blank"
          href={`https://twitter.com/${twitterData.screen_name}`}
        >
          Go to twitter
        </Button>
      </ButtonWrapper>
    </div>
  ) : null;

  return (
    <BaseSection
      title={__('Twitter')}
      content={content}
      isUseCustomer={true}
      name="showTwitter"
    />
  );
}

TwitterSection.propTypes = propTypes;
TwitterSection.contextTypes = {
  __: PropTypes.func,
  queryParams: PropTypes.object
};

export default TwitterSection;
