import CreateForm from 'modules/forms/containers/CreateForm';
import EditForm from 'modules/forms/containers/EditForm';
import { IFormData } from 'modules/forms/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { FlexItem } from './style';

type Props = {
  type: string;
  color: string;
  theme: string;
  isReadyToSaveForm: boolean;
  formData: IFormData;
  formId?: string;
  afterDbSave: (formId: string) => void;
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
      afterDbSave,
      onInit,
      formData,
      isReadyToSaveForm
    } = this.props;

    const doc = {
      afterDbSave,
      onDocChange,
      isReadyToSave: isReadyToSaveForm,
      onInit,
      formData,
      showMessage: false,
      type: 'lead'
    };

    if (formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  }

  render() {
    return <FlexItem>{this.renderContent()}</FlexItem>;
  }
}

export default FormStep;
