import { IUser } from 'modules/auth/types';
import { Icon, ModalTrigger, NameCard } from 'modules/common/components';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import * as React from 'react';
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
      <a href={link} target="_blank">
        <Icon icon={icon} />
      </a>
    );
  }

  renderLinks(links) {
    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube')}
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
              {__('Primary Email')}:
              <SidebarCounter>{user.email || '-'}</SidebarCounter>
            </li>
            <li>
              {__('User name')}:
              <SidebarCounter>{user.username || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Short name')}:
              <SidebarCounter>{details.shortName || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Location')}:
              <SidebarCounter>{details.location || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Position')}:
              <SidebarCounter>{details.position || '-'}</SidebarCounter>
            </li>
            <li>
              {__('Description')}:
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
