import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { ControlLabel, FormGroup } from 'modules/common/components/form';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import {
  ISkillDocument,
  ISkillTypesDocument
} from 'modules/settings/skills/types';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import mutations from '../../graphql/mutations';

type Props = {
  refetchSkills: (memberId: string) => void;
  closeModal: () => void;
  handleSkillTypeSelect: (typeId: string, userId: string) => void;
  user: IUser;
  loading: boolean;
  skillTypes: ISkillTypesDocument[];
  skills: ISkillDocument[];
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
