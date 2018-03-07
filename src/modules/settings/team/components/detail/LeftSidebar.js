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
import { EditProfile } from 'modules/settings/profile/components';
import { UserForm } from '../../containers';
import { Channel } from './styles';

const propTypes = {
  user: PropTypes.object.isRequired,
  saveProfile: PropTypes.func,
  saveUser: PropTypes.func,
  channels: PropTypes.array
};

class LeftSidebar extends React.Component {
  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;
    const { user, saveProfile, channels, saveUser } = this.props;
    const { details = {}, links = {} } = user;
    const { __, currentUser } = this.context;

    let form = <UserForm object={user} save={saveUser} />;

    if (currentUser._id === user._id) {
      form = <EditProfile save={saveProfile} currentUser={currentUser} />;
    }

    return (
      <Sidebar>
        <Section>
          <Title>{__('Details')}</Title>

          <QuickButtons>
            <a tabIndex={0}>
              <ModalTrigger
                title="Edit"
                trigger={<Icon icon="edit" />}
                size="lg"
              >
                {form}
              </ModalTrigger>
            </a>
          </QuickButtons>

          <SidebarContent>
            <center>
              <NameCard user={user} avatarSize={50} singleLine />
            </center>
            <SidebarList>
              <li>
                {__('Location')}:
                <SidebarCounter>{details.location || 'N/A'}</SidebarCounter>
              </li>
              <li>
                {__('Position')}:
                <SidebarCounter>{details.position || 'N/A'}</SidebarCounter>
              </li>
              <li>
                {__('Twitter Username')}:
                <SidebarCounter>
                  {details.twitterUsername || 'N/A'}
                </SidebarCounter>
              </li>
            </SidebarList>
          </SidebarContent>
        </Section>

        <Section>
          <Title>{__('Links')}</Title>

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
          <Title>{__('Channels')}</Title>
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
}

LeftSidebar.propTypes = propTypes;

LeftSidebar.contextTypes = {
  __: PropTypes.func,
  currentUser: PropTypes.object
};

export default LeftSidebar;
