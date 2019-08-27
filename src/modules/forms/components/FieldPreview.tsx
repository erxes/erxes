import ModalTrigger from 'modules/common/components/ModalTrigger';
import GenerateField from 'modules/settings/properties/components/GenerateField';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { FieldItem } from '../styles';

type Props = {
  field: IField;
  onFieldEdit?: (field: IField, props) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  render() {
    const { field, onFieldEdit } = this.props;

    const trigger = (
      <FieldItem selectType={field.type === 'select'} noPadding={true}>
        <GenerateField field={field} />
      </FieldItem>
    );

    const content = props =>
      onFieldEdit ? onFieldEdit(field, props) : <div />;

    return (
      <ModalTrigger
        title={`Edit field`}
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }
}

export default FieldPreview;
