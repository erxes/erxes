import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IChannel } from '../../../channels/types';
import { List } from './styles';

type Props = {
  user: IUser;
  channels: IChannel[];
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

class LeftSidebar extends React.Component<Props> {
  renderLink(link, icon) {
    if (!link) {
      return null;
    }

    return (
      <a href={link}>
        <Icon icon={icon} />
      </a>
    );
  }

  renderLinks(links) {
    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook-official')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube-play')}
        {this.renderLink(links.github, 'github-circled')}
        {this.renderLink(links.website, 'earthgrid')}
      </Links>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;
    const { user, channels, renderEditForm } = this.props;
    const { details = {}, links = {} } = user;

    const content = props => {
      return renderEditForm({ ...props, user });
    };

    return (
      <Sidebar wide={true}>
        <Section>
          <InfoWrapper>
            <NameCard
              user={user}
              avatarSize={50}
              secondLine={this.renderLinks(links)}
            />
            <ModalTrigger
              title="Edit"
              trigger={<Icon icon="edit" />}
              size="lg"
              content={content}
            />
          </InfoWrapper>
          <SidebarList className="no-link">
            <li>
              <FieldStyle>{__('Primary Email')}:</FieldStyle>
              <SidebarCounter>{user.email || '-'}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('User name')}:</FieldStyle>
              <SidebarCounter>{user.username || '-'}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Short name')}:</FieldStyle>
              <SidebarCounter>{details.shortName || '-'}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Location')}:</FieldStyle>
              <SidebarCounter>{details.location || '-'}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Position')}:</FieldStyle>
              <SidebarCounter>{details.position || '-'}</SidebarCounter>
            </li>
            <li>
              <FieldStyle>{__('Description')}:</FieldStyle>
              <SidebarCounter nowrap={true}>
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
                    <FieldStyle>{channel.name || ''}</FieldStyle>
                    <SidebarCounter>{channel.description || ''}</SidebarCounter>
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
