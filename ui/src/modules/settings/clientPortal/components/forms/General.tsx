import BoardSelect from 'erxes-ui/lib/boards/containers/BoardSelect';
import { FlexContent } from 'erxes-ui/lib/layout/styles';
import { PipelinePopoverContent } from 'modules/boards/styles/item';
import AvatarUpload from 'modules/common/components/AvatarUpload';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { ITopic } from 'modules/knowledgeBase/types';
import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Select from 'react-select-plus';
import { Content } from '../../styles';
import { GeneralFormType } from '../Form';

type Props = {
  topics: ITopic[];
  handleFormChange: (name: string, value: string) => void;
} & GeneralFormType;

type ControlItem = {
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
  url?: string;
};

function General({
  name,
  description,
  icon,
  logo,
  url,
  knowledgeBaseLabel,
  knowledgeBaseTopicId,
  topics,
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
  const handleSelectChange = (option?: { value: string; label: string }) => {
    handleFormChange('knowledgeBaseTopicId', !option ? '' : option.value);
  };

  function generateOptions() {
    if ((topics || []).length === 0) {
      return [];
    }

    return topics.map(topic => ({ value: topic._id, label: topic.title }));
  }

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
  }: ControlItem) {
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
        <FlexContent>
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
        </FlexContent>
      </FormGroup>
    );
  }

  function renderFavicon() {
    const handleAvatarUploader = (iconUrl: string) =>
      handleFormChange('icon', iconUrl);

    return (
      <FormGroup>
        <ControlLabel>Favicon</ControlLabel>
        <p>16x16px transparent PNG.</p>
        <AvatarUpload avatar={icon} onAvatarUpload={handleAvatarUploader} />
      </FormGroup>
    );
  }

  function renderLogo() {
    const handleAvatarUploader = (logoUrl: string) =>
      handleFormChange('logo', logoUrl);

    return (
      <FormGroup>
        <ControlLabel>Main Logo</ControlLabel>
        <AvatarUpload avatar={logo} onAvatarUpload={handleAvatarUploader} />
      </FormGroup>
    );
  }

  return (
    <Content>
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
        label: 'Website',
        formValueName: 'url',
        formValue: url
      })}

      <FlexContent>
        {renderFavicon()}
        {renderLogo()}
      </FlexContent>

      <FlexContent>
        {renderControl({
          label: 'Knowledge Base',
          subtitle: 'Shown name on menu',
          formValueName: 'knowledgeBaseLabel',
          formValue: knowledgeBaseLabel,
          placeholder: 'Please enter a label for Knowledge base'
        })}

        <FormGroup>
          <ControlLabel required={true}>Knowledge base topic</ControlLabel>
          <p>Knowledge base topic in Client Portal</p>
          <Select
            placeholder="Select a knowledge base topic"
            value={knowledgeBaseTopicId}
            options={generateOptions()}
            onChange={handleSelectChange}
          />
        </FormGroup>
      </FlexContent>

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
    </Content>
  );
}

export default General;
