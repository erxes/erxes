import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import { ISkillDocument } from 'modules/settings/skills/types';
import React, { useState } from 'react';
import mutations from '../../../skills/graphql/mutations';

type Props = {
  user: IUser;
  closeModal: () => void;
  skillTypes: ISkillDocument[];
};

function UserSkillForm({ skillTypes, closeModal, user }: Props) {
  const [isSubmitted, setSubmitted] = useState<boolean>(false);
  const [type, setType] = useState(null);
  const [skillId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillId) {
      return Alert.error('Please choose a skill');
    }

    setSubmitted(true);
  };

  function renderContent() {
    const handleTypeSelect = option => setType(option);
    const handleRefetch = () => {
      return null;
    };

    const getVariables = () => {
      if (!type) {
        return;
      }

      return {
        memberIds: [user._id],
        // typeId: type.value,
        skillId
      };
    };

    const generateSkillTypes = () => {
      return skillTypes.map(item => ({ label: item.name, value: item._id }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Skill type</ControlLabel>
          <FormControl
            placeholder={__('Choose a skill type')}
            value={type}
            options={generateSkillTypes()}
            onChange={handleTypeSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Skills</ControlLabel>
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          <ButtonMutate
            mutation={mutations.skillTypeEdit}
            variables={getVariables()}
            callback={closeModal}
            refetchQueries={handleRefetch}
            isSubmitted={isSubmitted}
            successMessage="You successfully added in skill"
            type="submit"
          />
        </ModalFooter>
      </>
    );
  }

  return <form onSubmit={handleSubmit}>{renderContent()}</form>;
}

export default UserSkillForm;
