import { IFormData } from '@erxes/ui-forms/src/forms/types';
import React from 'react';
import { IField } from '@erxes/ui/src/types';
import CreateForm from '@erxes/ui-forms/src/forms/containers/CreateForm';
import EditForm from '@erxes/ui-forms/src/forms/containers/EditForm';
import { FlexHeight } from '@erxes/ui/src/styles/main';

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
      formId,
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
      type: 'booking'
    };

    if (formId) {
      return <EditForm {...doc} formId={formId} />;
    }

    return <CreateForm {...doc} />;
  };

  return <FlexHeight>{renderContent()}</FlexHeight>;
}

export default FormStep;
