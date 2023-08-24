import React, { useState } from 'react';
import {
  __,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  Form as CommonForm,
  ModalTrigger,
  Alert
} from '@erxes/ui/src';
import { IFormProps } from '@erxes/ui/src/types';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';

export function CreateRootAction({ issue, createRootAction }) {
  const [data, setData] = useState({}) as any;

  const trigger = (
    <Button btnStyle="warning">
      {__(`Create Action (${issue?.taskIds?.length || 0})`)}
    </Button>
  );

  const content = ({ closeModal }) => {
    const formContent = (formProps: IFormProps) => {
      const handleSave = e => {
        if (e.key === 'Enter') {
          const { value } = e.currentTarget as HTMLInputElement;

          if (!value) {
            Alert.error('You must enter a name');
          }

          const payload = {
            issueId: issue._id,
            stageId: data.stageId,
            name: value
          };
          createRootAction(payload);
          closeModal();
        }
      };

      const handleState = data => {
        setData(data);
      };

      const boardSelectProps = {
        type: 'task',
        ...data,
        onChangeBoard: boardId => handleState({ boardId }),
        onChangePipeline: pipelineId =>
          handleState({ boardId: data?.boardId, pipelineId }),
        onChangeStage: stageId => handleState({ ...data, stageId })
      };

      return (
        <>
          <BoardSelect {...boardSelectProps} />
          {data?.stageId && (
            <FormGroup>
              <ControlLabel required>{__('Name')}</ControlLabel>
              <FormControl
                required
                {...formProps}
                type="text"
                name="name"
                placeholder="Type a name and press enter"
                onKeyPress={handleSave}
              />
            </FormGroup>
          )}
        </>
      );
    };

    return <CommonForm renderContent={formContent} />;
  };

  return <ModalTrigger title="RCFA" trigger={trigger} content={content} />;
}
