import {
  ISkillDocument,
  ISkillTypesDocument
} from '@erxes/ui-inbox/src/settings/skills/types';

import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import SkillForm from './SkillForm';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

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
        <Tip text={__('Delete')} placement="top">
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
