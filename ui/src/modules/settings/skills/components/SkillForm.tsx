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
import { ISkillTypesDocument } from '../types';

type Props = {
  skillTypes: ISkillTypesDocument[];
  refetchQueries: any;
  closeModal: () => void;
};

function SkillForm({ closeModal, skillTypes, refetchQueries }: Props) {
  const [isSubmitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState(null);
  const [memberIds, setMemberIds] = useState([]);

  const handleSubmit = () => {
    if (name.length === 0) {
      return Alert.error('Please enter a name');
    }

    if (!typeId) {
      return Alert.error('Please select a type');
    }

    if (memberIds.length === 0) {
      return Alert.error('Please add at least one team member');
    }

    return setSubmitted(true);
  };

  const getVariables = () => {
    return {
      name,
      typeId,
      memberIds
    };
  };

  function renderContent() {
    const handleInputChange = e => setName(e.target.value);
    const handleTypeSelect = value => setTypeId(value);
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
            onChange={handleInputChange}
            defaultValue={name}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Skill type</ControlLabel>
          <Select
            placeholder={__('Choose a skill type')}
            options={generateSkillTypes()}
            value={typeId}
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
          successMessage={__('You successfully added a skil')}
        />
      </ModalFooter>
    </form>
  );
}

export default SkillForm;
