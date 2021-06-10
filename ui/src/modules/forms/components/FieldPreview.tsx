import GenerateField from 'modules/settings/properties/components/GenerateField';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { FieldItem } from '../styles';

type Props = {
  field: IField;
  onClick?: (field: IField) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  render() {
    const { field, onClick } = this.props;
    const { logics = [], actions = [] } = field;
    let hasLogic = logics.length > 0;
    let hasAction = actions.length > 0;

    for (const logic of field.logics || []) {
      if (['show', 'hide'].includes(logic.logicAction)) {
        hasLogic = true;
      }

      if (['tag', 'deal', 'task', 'ticket'].includes(logic.logicAction)) {
        hasAction = true;
      }
    }

    const onClickItem = () => {
      if (onClick) {
        onClick(field);
      }
    };

    return (
      <FieldItem
        hasLogic={hasLogic}
        selectType={field.type === 'select' || field.type === 'multiSelect'}
        onClick={onClickItem}
      >
        <GenerateField
          field={field}
          hasLogic={hasLogic}
          hasAction={hasAction}
        />
      </FieldItem>
    );
  }
}

export default FieldPreview;
