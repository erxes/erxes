import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { List, SkillList } from './styles';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';

import Button from '@erxes/ui/src/components/Button';
import { EmptyState } from '@erxes/ui/src/components';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';

type Props = {
  user: IUser;
  channels: any[]; //check - IChannel
  skills: any[]; //check - ISkillDocument
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
          {skills.length > 0 ? (
            skills.map(skill => {
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
            })
          ) : (
            <EmptyState icon="ban" text="No skills" size="small" />
          )}
        </SkillList>
      </Section>
    );
  }

  function renderForms() {
    const content = () =>
      loadDynamicComponent('contactDetailLeftSidebar', {
        user: user,
        isDetail: true
      });

    const extraButton = (
      <ModalTrigger
        title="Properties"
        trigger={
          <Icon icon="expand-arrows-alt" style={{ cursor: 'pointer' }} />
        }
        size="xl"
        content={content}
      />
    );

    return loadDynamicComponent('contactDetailLeftSidebar', {
      user: user,
      isDetail: true
    });
  }

  return (
    <Sidebar wide={true}>
      {renderUserInfo()}
      {isEnabled('inbox') && renderChannels()}
      {isEnabled('inbox') && renderSkills()}
      {isEnabled('forms') && renderForms()}
    </Sidebar>
  );
}

export default LeftSidebar;
