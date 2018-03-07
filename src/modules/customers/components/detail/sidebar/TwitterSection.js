import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Sidebar } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const ButtonWrapper = styled.div`
  padding: 10px 20px;
`;

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
          <SidebarCounter>@{twitterData.screenName}</SidebarCounter>
        </li>
      </SidebarList>
      <ButtonWrapper>
        <Button
          block
          btnStyle="primary"
          target="_blank"
          href={`https://twitter.com/${twitterData.screenName}`}
        >
          Go to twitter
        </Button>
      </ButtonWrapper>
    </Sidebar.Section>
  );
}

TwitterSection.propTypes = propTypes;
TwitterSection.contextTypes = {
  __: PropTypes.func
};

export default TwitterSection;
