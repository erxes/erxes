import FieldForm from 'modules/common/components/form/FieldForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import GenerateField from 'modules/settings/properties/components/GenerateField';
import React from 'react';
import { IField } from '../../../../settings/properties/types';
import { FieldItem } from './styles';

type Props = {
  field: IField;
  onFieldEdit?: (field: IField, props) => void;
};

class FieldPreview extends React.Component<Props, {}> {
  renderContent = props => {
    const { field, onFieldEdit } = this.props;

    if (onFieldEdit) {
      return onFieldEdit(field, props);
    }
  };

  render() {
    const { field } = this.props;

    const trigger = (
      <FieldItem selectType={field.type === 'select'} noPadding={true}>
        <GenerateField field={field} />
      </FieldItem>
    );

    return (
      <ModalTrigger
        title={`Edit field`}
        size="lg"
        trigger={trigger}
        content={this.renderContent}
      />
    );
  }
}

export default FieldPreview;
