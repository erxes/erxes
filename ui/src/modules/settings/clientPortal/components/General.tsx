import BoardSelect from 'erxes-ui/lib/boards/containers/BoardSelect';
import { PipelinePopoverContent } from 'modules/boards/styles/item';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  name?: string;
  description?: string;
  knowledgeBaseLabel?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskPipelineId?: string;
  taskBoardId?: string;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
  handleFormChange: (name: string, value: string) => void;
};

function General({
  name,
  description,
  knowledgeBaseLabel,
  ticketLabel,
  taskLabel,
  taskStageId,
  taskPipelineId,
  taskBoardId,
  ticketStageId,
  ticketPipelineId,
  ticketBoardId,
  handleFormChange
}: Props) {
  const [show, setShow] = useState<boolean>(false);

  const handleToggleBoardSelect = () => setShow(!show);

  function renderBoardSelect({
    type,
    stageId,
    boardId,
    pipelineId
  }: {
    type: string;
    stageId?: string;
    boardId?: string;
    pipelineId?: string;
  }) {
    const onChangeStage = stgId => handleFormChange(`${type}StageId`, stgId);
    const onChangePipeline = plId =>
      handleFormChange(`${type}PipelineId`, plId);
    const onChangeBoard = brId => handleFormChange(`${type}BoardId`, brId);

    return (
      <Popover id="pipeline-popover">
        <PipelinePopoverContent>
          <BoardSelect
            type={type}
            stageId={stageId}
            boardId={boardId || ''}
            pipelineId={pipelineId || ''}
            onChangeStage={onChangeStage}
            onChangePipeline={onChangePipeline}
            onChangeBoard={onChangeBoard}
            autoSelectStage={false}
            callback={handleToggleBoardSelect}
          />
        </PipelinePopoverContent>
      </Popover>
    );
  }

  function renderControl({
    required,
    label,
    subtitle,
    formValueName,
    formValue,
    boardType,
    placeholder,
    formProps,
    stageId,
    pipelineId,
    boardId
  }: {
    required?: boolean;
    label: string;
    subtitle?: string;
    formValueName: string;
    formValue?: string;
    boardType?: string;
    placeholder?: string;
    formProps?: any;
    stageId?: string;
    pipelineId?: string;
    boardId?: string;
  }) {
    const handleChange = (e: React.FormEvent) => {
      handleFormChange(
        formValueName,
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        {subtitle && <p>{subtitle}</p>}
        <FormControl
          {...formProps}
          name={formValueName}
          value={formValue}
          placeholder={placeholder}
          onChange={handleChange}
        />
        {boardType && (
          <OverlayTrigger
            trigger="click"
            placement="bottom-start"
            overlay={renderBoardSelect({
              type: boardType,
              stageId,
              boardId,
              pipelineId
            })}
            rootClose={true}
          >
            <Icon icon="cog" size={24} />
          </OverlayTrigger>
        )}
      </FormGroup>
    );
  }

  return (
    <div>
      {renderControl({
        required: true,
        label: 'Client Portal Name',
        formValueName: 'name',
        formValue: name,
        formProps: {
          autoFocus: true
        }
      })}

      {renderControl({
        label: 'Description',
        formValueName: 'description',
        formValue: description
      })}

      {renderControl({
        label: 'Knowledge Base',
        subtitle: 'Shown name on menu',
        formValueName: 'knowledgeBaseLabel',
        formValue: knowledgeBaseLabel,
        placeholder: 'Please enter a label for Knowledge base'
      })}

      {renderControl({
        label: 'Tickets',
        subtitle: 'Shown name on menu',
        formValueName: 'ticketLabel',
        formValue: ticketLabel,
        placeholder: 'Please enter a label for Ticket',
        boardType: 'ticket',
        stageId: ticketStageId,
        pipelineId: ticketPipelineId,
        boardId: ticketBoardId
      })}

      {renderControl({
        label: 'Tasks',
        subtitle: 'Shown name on menu',
        formValueName: 'taskLabel',
        formValue: taskLabel,
        placeholder: 'Please enter a label for Task',
        boardType: 'task',
        stageId: taskStageId,
        pipelineId: taskPipelineId,
        boardId: taskBoardId
      })}
    </div>
  );
}

export default General;
