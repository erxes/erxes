import { GenerateField } from 'modules/settings/properties/components';
import React from 'react';
import { IField } from '../../../../settings/properties/types';
import { FieldItem } from './styles';

type Props = {
  field: IField;
  onEdit?: (field: IField) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  onEdit = () => {
    const { onEdit } = this.props;

    if (onEdit) {
      onEdit(this.props.field);
    }
  };

  render() {
    const { field } = this.props;

    return (
      <FieldItem
        onClick={this.onEdit}
        selectType={field.type === 'select'}
        noPadding={true}
      >
        <GenerateField field={field} />
      </FieldItem>
    );
  }
}

export default FieldPreview;
