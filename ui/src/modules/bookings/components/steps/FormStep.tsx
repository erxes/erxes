import { IFormData } from 'modules/forms/types';
import React from 'react';
import { IField } from 'modules/settings/properties/types';
import CreateForm from 'modules/forms/containers/CreateForm';
import { FlexItem } from './style';

type Props = {
  type?: string;
  color?: string;
  theme?: string;
  isReadyToSaveForm: boolean;
  formData?: IFormData;
  formId?: string;
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  onInit?: (fields: IField[]) => void;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
};

function FormStep(props: Props) {
  const renderContent = () => {
    const {
      // formId,
      onDocChange,
      afterDbSave,
      onInit,
      formData,
      isReadyToSaveForm
    } = props;

    const doc = {
      afterDbSave,
      onDocChange,
      isReadyToSave: isReadyToSaveForm,
      onInit,
      formData,
      showMessage: false,
      type: 'lead'
    };

    // if (formId) {
    //   return <EditForm {...doc} formId={formId} />;
    // }

    return <CreateForm {...doc} />;
  };

  return <FlexItem>{renderContent()}</FlexItem>;
}

export default FormStep;
