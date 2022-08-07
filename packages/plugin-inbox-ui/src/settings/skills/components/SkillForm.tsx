import { Alert, __ } from 'coreui/utils';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import {
  ISkillDocument,
  ISkillTypesDocument
} from '@erxes/ui-inbox/src/settings/skills/types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import mutations from '../graphql/mutations';

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

function SkillForm({
  closeModal,
  skill = {} as ISkillDocument,
  skillTypes,
  refetchQueries
}: Props) {
  const [isSubmitted, setSubmitted] = useState(false);
  const [name, setName] = useState<string>(skill.name || '');
  const [type, setType] = useState(getSkillType(skill, skillTypes));
  const [memberIds, setMemberIds] = useState<string[]>(skill.memberIds || []);

  const handleRefetch = () => refetchQueries(memberIds);

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

    const doc: { [key: string]: string | string[] } = {
      name,
      memberIds,
      typeId: typeof type === 'string' ? type : type.value,
      ...(skill ? { _id: skill._id } : {})
    };

    return doc;
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

  const mutateProps = {
    mutation: skill._id ? mutations.skillEdit : mutations.skillAdd,
    successMessage: __(
      `You successfully ${skill._id ? 'updated' : 'added'} a skill`
    )
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderContent()}
      <ModalFooter>
        <Button
          id="skill-form"
          btnStyle="simple"
          type="button"
          onClick={closeModal}
          icon="times-circle"
        >
          Cancel
        </Button>
        <ButtonMutate
          {...mutateProps}
          variables={getVariables()}
          callback={closeModal}
          refetchQueries={handleRefetch}
          isSubmitted={isSubmitted}
          type="submit"
        />
      </ModalFooter>
    </form>
  );
}

export default SkillForm;
