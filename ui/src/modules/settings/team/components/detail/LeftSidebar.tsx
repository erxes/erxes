import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
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
};

const { Section } = Sidebar;
const { Title } = Section;

function LeftSidebar({
  user,
  skills = [],
  channels,
  excludeUserSkill,
  renderSkillForm
}: Props) {
  const { details = {} } = user;

  const renderRow = (title: string, value: any, nowrap?: boolean) => {
    return (
      <li>
        <FieldStyle>{__(title)}:</FieldStyle>
        <SidebarCounter nowrap={nowrap}>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  function renderUserInfo() {
    return (
      <Section>
        <SidebarList className="no-link">
          {renderRow('Primary Email', user.email)}
          {renderRow('Operator Phone number', details.operatorPhone)}
          {renderRow('User name', user.username)}
          {renderRow('Short name', details.shortName)}
          {renderRow('Location', details.location)}
          {renderRow(
            'Birthdate',
            details.birthDate
              ? dayjs(details.birthDate).format('YYYY-MM-DD')
              : '-'
          )}
          {renderRow('Position', details.position)}
          {renderRow('Score', user.score)}
          {renderRow(
            'Joined date',
            details.workStartedDate
              ? dayjs(details.workStartedDate).format('YYYY-MM-DD')
              : '-'
          )}
          {renderRow('Description', details.description, true)}
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
      {renderChannels()}
      {renderSkills()}
      <CustomFieldsSection user={user} isDetail={true} />
    </Sidebar>
  );
}

export default LeftSidebar;
