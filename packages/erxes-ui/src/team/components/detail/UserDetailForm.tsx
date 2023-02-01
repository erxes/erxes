import ActionSection from '../../containers/ActionSection';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IUser } from '@erxes/ui/src/auth/types';
import InfoSection from './InfoSection';
import LeftSidebar from './LeftSidebar';
import React, { useState } from 'react';
import { UserHeader, BoxWrapper } from './styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';
import {
  Box,
  ControlLabel,
  FormGroup,
  __,
  Button,
  Form as CommonForm,
  ModalTrigger
} from '@erxes/ui/src';
import { ButtonRelated, ModalFooter } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { IButtonMutateProps } from '../../../types';
import UserMovementForm from '../../containers/UserMovementForm';

type Props = {
  user: IUser;
  channels: any[]; // check - IChannel
  skills: any[]; // check - ISkillDocument
  participatedConversations: any[]; // check - IConversation
  totalConversationCount: number;
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
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function UserDetails({
  user,
  skills,
  channels,
  excludeUserSkill,
  renderSkillForm,
  renderEditForm,
  renderButton
}: Props) {
  const { details = {} } = user;
  const [department, setDepartmentIds] = useState({
    ids: user.departmentIds || [],
    isChanged: false
  });
  const [branch, setBranchIds] = useState({
    ids: user.branchIds || [],
    isChanged: false
  });
  const title = details.fullName || 'Unknown';
  const breadcrumb = [{ title: 'Users', link: '/settings/team' }, { title }];

  if (!user._id) {
    return (
      <EmptyState
        image="/images/actions/11.svg"
        text="User not found"
        size="small"
      />
    );
  }

  const list = (
    ids: string[],
    isChanged: boolean,
    label: string,
    key: string,
    handleState
  ) => {
    let Selection;

    const handleChange = value => {
      handleState({ ids: value, isChanged: true });
    };

    if (key === 'department') {
      Selection = SelectDepartments;
    }
    if (key === 'branch') {
      Selection = SelectBranches;
    }

    const content = formProps => {
      const callback = () => {
        handleState(prev => ({ ids: prev.ids, isChanged: false }));
      };
      const handleCancel = () => {
        handleState({ ids: user[`${key}Ids`], isChanged: false });
      };

      const generateDoc = () => {
        user.details && delete user.details['__typename'];
        return { ...user, [`${key}Ids`]: ids };
      };

      const movementForm = () => {
        const trigger = (
          <ButtonRelated>
            <span>{`See User Movement of ${label}`}</span>
          </ButtonRelated>
        );

        const content = props => {
          const updatedProps = {
            ...props,
            userId: user._id,
            contentType: key
          };
          return <UserMovementForm {...updatedProps} />;
        };

        return (
          <ModalTrigger
            title={`User ${label} Movements`}
            content={content}
            trigger={trigger}
            size="xl"
          />
        );
      };

      return (
        <BoxWrapper>
          <FormGroup>
            <ControlLabel>{__(`${label}`)}</ControlLabel>
            <Selection
              label={`Choose ${label}`}
              name={`${key}Ids`}
              initialValue={ids}
              onSelect={value => handleChange(value)}
              filterParams={{ withoutUserFilter: true }}
            />
          </FormGroup>
          {isChanged && (
            <ModalFooter>
              <Button btnStyle="simple" onClick={handleCancel}>
                {__('Cancel')}
              </Button>
              {renderButton({
                text: 'user movement',
                values: generateDoc(),
                isSubmitted: formProps.isSubmitted,
                callback
              })}
            </ModalFooter>
          )}
          {movementForm()}
        </BoxWrapper>
      );
    };
    return <CommonForm renderContent={content} />;
  };

  const leftSidebar = (
    <Sidebar>
      <Sidebar>
        <Box title="Branches">
          {list(
            branch.ids,
            branch.isChanged,
            'Branches',
            'branch',
            setBranchIds
          )}
        </Box>
        <Box title="Departments">
          {list(
            department.ids,
            department.isChanged,
            'Departments',
            'department',
            setDepartmentIds
          )}
        </Box>
      </Sidebar>
      {loadDynamicComponent('contactDetailRightSidebar', { user })}
    </Sidebar>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      mainHead={
        <UserHeader>
          <InfoSection
            nameSize={16}
            avatarSize={60}
            user={user}
            renderEditForm={renderEditForm}
          >
            <ActionSection user={user} renderEditForm={renderEditForm} />
          </InfoSection>
          {loadDynamicComponent('contactDetailHeader', { customer: user })}
        </UserHeader>
      }
      leftSidebar={
        <LeftSidebar
          user={user}
          channels={channels}
          skills={skills}
          excludeUserSkill={excludeUserSkill}
          renderSkillForm={renderSkillForm}
        />
      }
      rightSidebar={leftSidebar}
      content={loadDynamicComponent('contactDetailContent', { contact: user })}
      transparent={true}
    />
  );
}

export default UserDetails;
