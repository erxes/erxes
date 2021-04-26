import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ISkillDocument, ISkillTypesDocument } from '../types';
import SkillForm from './SkillForm';

type Props = {
  skill: ISkillDocument;
  skillTypes: ISkillTypesDocument[];
  refetchQueries: any;
  removeItem: (id: string) => void;
};

function SkillRow({ skill, skillTypes, refetchQueries, removeItem }: Props) {
  const handleRemove = () => removeItem(skill._id);
  const getSkillType = () => {
    const type = skillTypes.find(item => item._id === skill.typeId);

    if (!type) {
      return '-';
    }

    return type.name;
  };

  const renderForm = formProps => {
    return (
      <SkillForm
        {...formProps}
        skill={skill}
        skillTypes={skillTypes}
        refetchQueries={refetchQueries}
      />
    );
  };

  function renderActions() {
    const trigger = (
      <Button id="skill-edit-skill" btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit skill"
          trigger={trigger}
          content={renderForm}
        />
        <Tip text="Delete" placement="top">
          <Button btnStyle="link" onClick={handleRemove}>
            <Icon icon="times-circle" />
          </Button>
        </Tip>
      </ActionButtons>
    );
  }

  return (
    <tr key={skill._id}>
      <td>{skill.name}</td>
      <td>{getSkillType()}</td>
      <td>{renderActions()}</td>
    </tr>
  );
}

export default SkillRow;
