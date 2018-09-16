import { IUser } from 'modules/auth/types';
import { Icon, ModalTrigger, NameCard } from 'modules/common/components';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IChannel } from 'modules/settings/channels/types';
import { EditProfile } from 'modules/settings/profile/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { UserForm } from '../../containers';
import { List } from './styles';

type Props = {
  user: IUser,
  saveProfile: (variables: any) => void,
  saveUser: ({ doc }: { doc: any }, callback: () => void) => void,
  channels:IChannel[],
  currentUser: IUser
};

class LeftSidebar extends React.Component<Props> {
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
        {this.renderLink(links.facebook, 'facebook')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube')}
        {this.renderLink(links.github, 'github')}
        {this.renderLink(links.website, 'earthgrid')}
      </Links>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;
    const { user, saveProfile, channels, saveUser, currentUser } = this.props;
    const { details = {}, links = {} } = user;

    let form = <UserForm object={user} save={saveUser} />;

    if (currentUser._id === user._id) {
      form = <EditProfile save={saveProfile} currentUser={currentUser} />;
    }

    return (
      <Sidebar wide>
        <Section>
          <InfoWrapper>
            <NameCard
              user={user}
              avatarSize={50}
              secondLine={this.renderLinks(links)}
            />
            <ModalTrigger title="Edit" trigger={<Icon icon="edit" />} size="lg">
              {form}
            </ModalTrigger>
          </InfoWrapper>
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

export default LeftSidebar;
