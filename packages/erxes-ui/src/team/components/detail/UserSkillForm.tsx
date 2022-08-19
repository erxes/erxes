import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IUser } from '@erxes/ui/src/auth/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import mutations from '../../graphql/mutations';

type Props = {
  refetchSkills: (memberId: string) => void;
  closeModal: () => void;
  handleSkillTypeSelect: (typeId: string, userId: string) => void;
  user: IUser;
  loading: boolean;
  skillTypes: any[]; //check - ISkillTypesDocument
  skills: any[]; //check - ISkillDocument
};

function UserSkillForm({
  skillTypes,
  skills,
  loading,
  handleSkillTypeSelect,
  refetchSkills,
  closeModal,
  user
}: Props) {
  const [isSubmitted, setSubmitted] = useState<boolean>(false);
  const [type, setType] = useState(null);
  const [skillIds, setSkillIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (skillIds.length === 0) {
      return Alert.error('Please choose a skills');
    }

    setSubmitted(true);
  };

  function renderContent() {
    const handleTypeSelect = option => {
      setType(option);

      handleSkillTypeSelect(option.value, user._id);
    };

    const handleSkillsChange = (
      options: [{ label: string; value: string }]
    ) => {
      setSkillIds(options.map(option => option.value));
    };

    const handleRefetch = () => {
      return refetchSkills(user._id);
    };

    const getVariables = () => {
      if (!type) {
        return;
      }

      return {
        memberId: user._id,
        skillIds
      };
    };

    const generateOptions = options => {
      return options.map(item => ({ label: item.name, value: item._id }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Skill type</ControlLabel>
          <Select
            placeholder={__('Choose a skill type')}
            value={type}
            options={generateOptions(skillTypes)}
            onChange={handleTypeSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Skills</ControlLabel>
          <Select
            placeholder={__('Choose a skill type first')}
            value={skillIds}
            isLoading={loading}
            options={generateOptions(skills)}
            onChange={handleSkillsChange}
            multi={true}
          />
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
            mutation={mutations.userAddSkill}
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
