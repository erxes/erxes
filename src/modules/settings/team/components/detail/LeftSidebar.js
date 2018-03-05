import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
import { Icon, NameCard, ModalTrigger, Tip } from 'modules/common/components';
import { UserForm } from '../../containers';
import { Channel } from './styles';

const propTypes = {
  user: PropTypes.object.isRequired,
  save: PropTypes.func,
  channels: PropTypes.array
};

function LeftSidebar({ user, save, channels }) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;
  const { details = {}, links = {} } = user;

  return (
    <Sidebar>
      <Section>
        <Title>Details</Title>

        <QuickButtons>
          <a tabIndex={0}>
            <ModalTrigger
              title="Edit Team Member"
              trigger={<Icon icon="edit" />}
              size="lg"
            >
              <UserForm object={user} save={save} />
            </ModalTrigger>
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
      </Section>

      <Section>
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
      </Section>

      <Section>
        <Title>Channels</Title>
        <SidebarContent>
          <Channel>
            {channels.map(channel => {
              return (
                <div key={channel._id}>
                  <Link to={`/settings/channels?id=${channel._id}`}>
                    <Icon icon="android-open" />
                  </Link>
                  <div>{channel.name || ''}</div>
                  <Tip text={channel.description || ''}>
                    <span>{channel.description || ''}</span>
                  </Tip>
                </div>
              );
            })}
          </Channel>
        </SidebarContent>
      </Section>
    </Sidebar>
  );
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
