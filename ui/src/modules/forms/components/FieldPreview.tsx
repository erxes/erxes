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

    const onClickItem = () => {
      if (onClick) {
        onClick(field);
      }
    };

    return (
      <FieldItem
        selectType={field.type === 'select'}
        noPadding={true}
        onClick={onClickItem}
      >
        <GenerateField field={field} />
      </FieldItem>
    );
  }
}

export default FieldPreview;
