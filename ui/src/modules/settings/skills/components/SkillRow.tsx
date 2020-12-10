import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { ActionButtons } from 'modules/settings/styles';
import React from 'react';
import { ISkillDocument, ISkillTypesDocument } from '../types';

type Props = {
  skill: ISkillDocument;
  skillTypes: ISkillTypesDocument[];
  refetchQueries: any;
  removeItem: (id: string) => void;
};

function SkillRow({ skill, skillTypes, removeItem }: Props) {
  const handleRemove = () => removeItem(skill._id);
  const getSkillType = () => {
    const type = skillTypes.find(item => item._id === skill.typeId);

    if (!type) {
      return '-';
    }

    return type.name;
  };

  return (
    <tr key={skill._id}>
      <td>{skill.name}</td>
      <td>{getSkillType()}</td>
      <td>
        <ActionButtons>
          <Tip text="Delete" placement="top">
            <Button btnStyle="link" onClick={handleRemove}>
              <Icon icon="times-circle" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
}

export default SkillRow;
