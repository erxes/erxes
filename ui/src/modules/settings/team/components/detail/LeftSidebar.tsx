import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ISkillDocument } from 'modules/settings/skills/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { IChannel } from '../../../channels/types';
import CustomFieldsSection from '../../containers/CustomFieldsSection';
import { List, SkillList } from './styles';

type Props = {
  user: IUser;
  channels: IChannel[];
  skills: ISkillDocument[];
  excludeUserSkill: (skillId: string, userId: string) => void;
  renderSkillForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
  renderEditForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

const { Section } = Sidebar;
const { Title } = Section;

function LeftSidebar({
  user,
  skills = [],
  channels,
  excludeUserSkill,
  renderSkillForm,
  renderEditForm
}: Props) {
  const { details = {}, links = {} } = user;

  const content = props => {
    return renderEditForm({ ...props, user });
  };

  function renderLink(link, icon) {
    if (!link) {
      return null;
    }

    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        <Icon icon={icon} />
      </a>
    );
  }

  function renderLinks(item) {
    return (
      <Links>
        {renderLink(item.facebook, 'facebook-official')}
        {renderLink(item.linkedIn, 'linkedin')}
        {renderLink(item.twitter, 'twitter')}
        {renderLink(item.youtube, 'youtube-play')}
        {renderLink(item.github, 'github-circled')}
        {renderLink(item.website, 'external-link-alt')}
      </Links>
    );
  }

  function renderUserInfo() {
    return (
      <Section>
        <InfoWrapper>
          <NameCard
            user={user}
            avatarSize={50}
            secondLine={renderLinks(links)}
          />
          <ModalTrigger
            title="Edit"
            trigger={<Icon icon="pen-1" />}
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
            <FieldStyle>{__('Birthdate')}:</FieldStyle>
            <SidebarCounter>
              {details.birthDate
                ? dayjs(details.birthDate).format('YYYY-MM-DD')
                : '-'}
            </SidebarCounter>
          </li>
          <li>
            <FieldStyle>{__('Position')}:</FieldStyle>
            <SidebarCounter>{details.position || '-'}</SidebarCounter>
          </li>
          <li>
            <FieldStyle>{__('Joined date')}:</FieldStyle>
            <SidebarCounter>
              {details.workStartedDate
                ? dayjs(details.workStartedDate).format('YYYY-MM-DD')
                : '-'}
            </SidebarCounter>
          </li>
          <li>
            <FieldStyle>{__('Description')}:</FieldStyle>
            <SidebarCounter nowrap={true}>
              {details.description || '-'}
            </SidebarCounter>
          </li>
        </SidebarList>
      </Section>
    );
  }

  function renderChannels() {
    return (
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
    );
  }

  function renderSkills() {
    const getContent = props => {
      return renderSkillForm(props);
    };

    return (
      <Section>
        <Title>{__('Skills')}</Title>
        <Section.QuickButtons>
          <ModalTrigger
            title="Edit"
            trigger={<Button btnStyle="simple" size="small" icon="cog" />}
            content={getContent}
          />
        </Section.QuickButtons>
        <SkillList>
          {skills.map(skill => {
            const handleRemove = () => excludeUserSkill(skill._id, user._id);

            return (
              <Button
                key={skill._id}
                btnStyle="simple"
                size="small"
                onClick={handleRemove}
              >
                {skill.name}&nbsp;
                <Icon icon="times-circle" color="#EA475D" />
              </Button>
            );
          })}
        </SkillList>
      </Section>
    );
  }

  return (
    <Sidebar wide={true}>
      {renderUserInfo()}
      <CustomFieldsSection user={user} isDetail={true} />
      {renderChannels()}
      {renderSkills()}
    </Sidebar>
  );
}

export default LeftSidebar;
