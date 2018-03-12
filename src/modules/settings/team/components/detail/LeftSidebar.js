import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent, SidebarList } from 'modules/layout/styles';
import { Icon, NameCard, ModalTrigger } from 'modules/common/components';
import { EditProfile } from 'modules/settings/profile/components';
import { UserForm } from '../../containers';
import { Channel, Info } from './styles';

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
                <Info>{details.location || 'N/A'}</Info>
              </li>
              <li>
                {__('Position')}:
                <Info>{details.position || 'N/A'}</Info>
              </li>
              <li>
                {__('Twitter Username')}:
                <Info>{details.twitterUsername || 'N/A'}</Info>
              </li>
              <li>
                Mini-resume:
                <Info>{details.description || 'N/A'}</Info>
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
                <Info>{links.linkedIn || 'N/A'}</Info>
              </li>
              <li>
                Twitter:
                <Info>{links.twitter || 'N/A'}</Info>
              </li>
              <li>
                Facebook:
                <Info>{links.facebook || 'N/A'}</Info>
              </li>
              <li>
                Github:
                <Info>{links.github || 'N/A'}</Info>
              </li>
              <li>
                Youtube:
                <Info>{links.youtube || 'N/A'}</Info>
              </li>
              <li>
                Website:
                <Info>{links.website || 'N/A'}</Info>
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
                    <span>{channel.description || ''}</span>
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
