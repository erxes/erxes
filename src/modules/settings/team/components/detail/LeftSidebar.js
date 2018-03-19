import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { Icon, NameCard, ModalTrigger } from 'modules/common/components';
import { EditProfile } from 'modules/settings/profile/components';
import { UserForm } from '../../containers';
import { List, User, Links } from './styles';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';

const propTypes = {
  user: PropTypes.object.isRequired,
  saveProfile: PropTypes.func,
  saveUser: PropTypes.func,
  channels: PropTypes.array
};

class LeftSidebar extends React.Component {
  renderLink(link, icon) {
    if (link) {
      return (
        <a href={link} target="_blank">
          <Icon icon={icon} />
        </a>
      );
    }
    return null;
  }
  renderLinks(links) {
    return (
      <Links>
        {this.renderLink(links.linkedIn, 'social-linkedin')}
        {this.renderLink(links.twitter, 'social-twitter')}
        {this.renderLink(links.facebook, 'social-facebook')}
        {this.renderLink(links.github, 'social-github')}
        {this.renderLink(links.youtube, 'social-youtube')}
        {this.renderLink(links.website, 'android-globe')}
      </Links>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;
    const { user, saveProfile, channels, saveUser } = this.props;
    const { details = {}, links = {} } = user;
    const { __, currentUser } = this.context;

    let form = <UserForm object={user} save={saveUser} />;

    if (currentUser._id === user._id) {
      form = <EditProfile save={saveProfile} currentUser={currentUser} />;
    }

    return (
      <Sidebar wide>
        <Section>
          <SidebarContent>
            <User>
              <NameCard
                user={user}
                avatarSize={50}
                secondLine={this.renderLinks(links)}
              />
              <a tabIndex={0}>
                <ModalTrigger
                  title="Edit"
                  trigger={<Icon icon="edit" />}
                  size="lg"
                >
                  {form}
                </ModalTrigger>
              </a>
            </User>
          </SidebarContent>
          <SidebarList className="no-link">
            <li>
              {__('Location')}:
              <SidebarCounter>{details.location || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Position')}:
              <SidebarCounter>{details.position || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Twitter Username')}:
              <SidebarCounter>{details.twitterUsername || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Mini-resume')}:
              <SidebarCounter nowrap>
                {details.description || '-'}
              </SidebarCounter>
            </li>
          </SidebarList>
        </Section>

        <Section>
          <Title>{__('Channels')}</Title>
          <List>
            {channels.map(channel => {
              return (
                <li key={channel._id}>
                  <Link to={`/settings/channels?id=${channel._id}`}>
                    <div>{channel.name || ''}</div>
                    <p>{channel.description || ''}</p>
                  </Link>
                </li>
              );
            })}
          </List>
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
