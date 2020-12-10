import Button from 'modules/common/components/Button';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import mutations from '../graphql/mutations';
import { ISkillDocument, ISkillTypesDocument } from '../types';

type Props = {
  skill: ISkillDocument;
  skillTypes: ISkillTypesDocument[];
  refetchQueries: any;
  closeModal: () => void;
};

const getSkillType = (skill, types) => {
  const option = types.find(type => type._id === skill.typeId);

  if (!option) {
    return null;
  }

  return option._id;
};

function SkillForm({ closeModal, skill, skillTypes, refetchQueries }: Props) {
  const [isSubmitted, setSubmitted] = useState(false);
  const [name, setName] = useState<string>(skill.name || '');
  const [type, setType] = useState(getSkillType(skill, skillTypes));
  const [memberIds, setMemberIds] = useState<string[]>(skill.memberIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length === 0) {
      return Alert.error('Please enter a name');
    }

    if (!type) {
      return Alert.error('Please select a type');
    }

    if (memberIds.length === 0) {
      return Alert.error('Please add at least one team member');
    }

    return setSubmitted(true);
  };

  const getVariables = () => {
    if (!type) {
      return;
    }

    return {
      name,
      memberIds,
      typeId: type.value,
      ...(skill ? { _id: skill._id } : {})
    };
  };

  function renderContent() {
    const handleInputChange = e => setName(e.target.value);
    const handleTypeSelect = option => setType(option);
    const handleTeamMemberSelect = ids => setMemberIds(ids);

    const generateSkillTypes = () => {
      return skillTypes.map(item => ({ label: item.name, value: item._id }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>name</ControlLabel>
          <FormControl
            required={true}
            autoFocus={true}
            onChange={handleInputChange}
            defaultValue={name}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Skill type</ControlLabel>
          <Select
            placeholder={__('Choose a skill type')}
            value={type}
            options={generateSkillTypes()}
            onChange={handleTypeSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Team members</ControlLabel>
          <SelectTeamMembers
            label="Choose team members"
            name="memberIds"
            initialValue={memberIds}
            onSelect={handleTeamMemberSelect}
          />
        </FormGroup>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {renderContent()}
      <ModalFooter>
        <Button
          id="skill-form"
          btnStyle="simple"
          type="button"
          onClick={closeModal}
          icon="cancel-1"
        >
          Cancel
        </Button>
        <ButtonMutate
          mutation={mutations.skillAdd}
          variables={getVariables()}
          callback={closeModal}
          refetchQueries={refetchQueries}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__('You successfully added a skill')}
        />
      </ModalFooter>
    </form>
  );
}

export default SkillForm;
