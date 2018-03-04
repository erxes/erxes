import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
import { Icon, NameCard } from 'modules/common/components';

const propTypes = {
  user: PropTypes.object.isRequired
};

function LeftSidebar({ user }) {
  const { Title, QuickButtons } = Sidebar.Section;
  const { details = {}, links = {} } = user;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>Details</Title>

        <QuickButtons>
          <a tabIndex={0}>
            <Icon icon="edit" />
          </a>
        </QuickButtons>

        <SidebarContent>
          <center>
            <NameCard user={user} avatarSize={50} singleLine />
          </center>
          <SidebarList>
            <li>
              Location:
              <SidebarCounter>{details.location || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Position:
              <SidebarCounter>{details.position || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Twitter Username:
              <SidebarCounter>
                {details.twitterUsername || 'N/A'}
              </SidebarCounter>
            </li>
          </SidebarList>
        </SidebarContent>
      </Sidebar.Section>

      <Sidebar.Section>
        <Title>Links</Title>

        <SidebarContent>
          <SidebarList>
            <li>
              Linked In:
              <SidebarCounter>{links.linkedIn || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Twitter:
              <SidebarCounter>{links.twitter || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Facebook:
              <SidebarCounter>{links.facebook || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Github:
              <SidebarCounter>{links.github || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Youtube:
              <SidebarCounter>{links.youtube || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Website:
              <SidebarCounter>{links.website || 'N/A'}</SidebarCounter>
            </li>
          </SidebarList>
        </SidebarContent>
      </Sidebar.Section>
    </Sidebar>
  );
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
