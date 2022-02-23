import { IConfig } from '@erxes/ui-settings/src/general/types';
import GenerateField from '@erxes/ui-settings/src/properties/components/GenerateField';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { FieldItem } from '../styles';

type Props = {
  field: IField;
  configs: IConfig[];
  onClick?: (field: IField) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  render() {
    const { field, configs, onClick } = this.props;
    const hasLogic = field.logics ? field.logics.length > 0 : false;

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
        <GenerateField field={field} hasLogic={hasLogic} configs={configs} />
      </FieldItem>
    );
  }
}

export default FieldPreview;
