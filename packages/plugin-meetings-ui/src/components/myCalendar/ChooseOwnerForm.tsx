import React, { useState } from 'react';
import { Button, ControlLabel, Form, SelectTeamMembers } from '@erxes/ui/src';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  closeModal: () => void;
  pinnedUserIds: string[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  currentUser: IUser;
};
const ChooseOwnerForm = (props: Props) => {
  const { pinnedUserIds, currentUser } = props;

  const [pinnedIds, setPinnedUserIds] = useState([pinnedUserIds] || []);

  const generateDoc = values => {
    const finalValues = values;

    if (pinnedIds) {
      finalValues.pinnedUserIds = pinnedIds;
    }
    return {
      ...finalValues
    };
  };

  const onUserSelect = users => {
    setPinnedUserIds(users);
  };

  const renderContent = formProps => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;
    const object = pinnedUserIds;

    return (
      <>
        <FormGroup>
          <div style={{ marginBottom: '0' }}>
            <ControlLabel>Team members </ControlLabel>
            <div style={{ width: '100%' }}>
              <SelectTeamMembers
                initialValue={pinnedUserIds}
                customField="userIds"
                filterParams={{ excludeIds: true, ids: [currentUser?._id] }}
                label={'Select team member'}
                onSelect={onUserSelect}
                name="userId"
              />
            </div>
          </div>
        </FormGroup>
        <ModalFooter id={'AddTeamMembersButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'Pinned Users',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: object
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ChooseOwnerForm;
