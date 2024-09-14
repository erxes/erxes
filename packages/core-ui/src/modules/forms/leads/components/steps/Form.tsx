import Form from '@erxes/ui-forms/src/forms/components/Form';
import { IFormData } from '@erxes/ui-forms/src/forms/types';
import { FlexItem } from '@erxes/ui/src/components/step/style';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  type: string;
  color: string;
  theme: string;
  isReadyToSaveForm: boolean;
  form: IFormData;
  formId?: string;
  // afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  onInit?: (fields: IField[]) => void;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
};

class FormStep extends React.Component<Props> {
  renderContent() {
    const {
      formId,
      onDocChange,

      onInit,
      form,
      isReadyToSaveForm,
    } = this.props;

    // isReadyToSave: boolean;
    // type: string;

    const doc = {
      onDocChange,
      isReadyToSave: isReadyToSaveForm,
      onInit,
      formData: form,
      showMessage: false,
      type: 'lead',
      formId,
    };

    return <Form {...doc} />;
  }

  render() {
    return <FlexItem>{this.renderContent()}</FlexItem>;
  }
}

export default FormStep;
