import Button from 'erxes-ui/lib/components/Button';
import React, { useState } from 'react';
import { CONFIG_TYPES } from '../constants';
import General from './General';

type GeneralFormType = {
  name?: string;
  description?: string;
  knowledgeBaseLabel?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskBoardId?: string;
  taskPipelineId?: string;
  ticketStageId?: string;
  ticketBoardId?: string;
  ticketPipelineId?: string;
};

type Props = {
  configType: string;
  defaultFormValues?: GeneralFormType;
};

function Form({ defaultFormValues = {}, configType }: Props) {
  const [formValues, setFormValues] = useState<GeneralFormType>({
    name: defaultFormValues.name || '',
    description: defaultFormValues.description || '',
    knowledgeBaseLabel: defaultFormValues.knowledgeBaseLabel || '',
    ticketLabel: defaultFormValues.ticketLabel || '',
    taskLabel: defaultFormValues.taskLabel || '',
    taskStageId: defaultFormValues.taskStageId || '',
    taskBoardId: defaultFormValues.taskBoardId || '',
    taskPipelineId: defaultFormValues.taskPipelineId || '',
    ticketStageId: defaultFormValues.ticketStageId || '',
    ticketBoardId: defaultFormValues.ticketBoardId || '',
    ticketPipelineId: defaultFormValues.ticketPipelineId || ''
  });

  const handleFormChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
  };

  function renderContent() {
    if (configType === CONFIG_TYPES.GENERAL) {
      return <General {...formValues} handleFormChange={handleFormChange} />;
    }

    return null;
  }

  function renderSubmit() {
    return (
      <Button btnStyle="success" type="submit">
        Submit
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {renderContent()}
      {renderSubmit()}
    </form>
  );
}

export default Form;
