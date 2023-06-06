import {
  Block,
  BlockRow,
  BlockRowTitle,
  Features,
  IconWrap,
  ToggleWrap
} from '../../styles';
import { IBoard, IPipeline } from '@erxes/ui-cards/src/boards/types';
import React, { useState } from 'react';
import { __, isEnabled } from '@erxes/ui/src/utils/core';

import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ClientPortalConfig } from '../../types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ISelectedOption } from '@erxes/ui/src/types';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { OverlayTrigger } from 'react-bootstrap';
import Select from 'react-select-plus';
import Toggle from '@erxes/ui/src/components/Toggle';

type Props = {
  topics: ITopic[];
  boards: IBoard[];
  pipelines: IPipeline[];
  fetchPipelines: (boardId: string) => void;
  handleFormChange: (name: string, value: string | boolean) => void;
} & ClientPortalConfig;

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
  className?: string;
};

function General({
  name,
  description,
  url,
  messengerBrandCode,
  knowledgeBaseLabel,
  knowledgeBaseTopicId,
  taskPublicBoardId,
  taskPublicPipelineId,
  taskPublicLabel,
  topics,
  boards,
  pipelines,
  ticketLabel,
  taskLabel,
  dealLabel,
  purchaseLabel,
  taskStageId,
  taskPipelineId,
  taskBoardId,
  ticketStageId,
  ticketPipelineId,
  ticketBoardId,
  dealStageId,
  dealPipelineId,
  dealBoardId,
  purchaseStageId,
  purchasePipelineId,
  purchaseBoardId,
  fetchPipelines,
  handleFormChange,
  kbToggle,
  publicTaskToggle,
  taskToggle,
  dealToggle,
  purchaseToggle,
  ticketToggle
}: Props) {
  const [show, setShow] = useState<boolean>(false);

  const handleToggleBoardSelect = () => setShow(!show);

  const handleSelectChange = (option?: { value: string; label: string }) => {
    handleFormChange('knowledgeBaseTopicId', !option ? '' : option.value);
  };

  const onChangeToggle = (key: string, value: boolean) => {
    handleFormChange(key, value);
  };

  function generateOptions(options: any, valueKey: string, labelKey: string) {
    if ((options || []).length === 0) {
      return [];
    }

    return options.map(option => ({
      value: option[valueKey],
      label: option[labelKey]
    }));
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

    return isEnabled('cards') ? (
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
    ) : null;
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
    boardId,
    className
  }: ControlItem) {
    const handleChange = (e: React.FormEvent) => {
      const value = (e.target as HTMLInputElement).value;

      handleFormChange(formValueName, value);
    };

    return (
      <div className={className && className}>
        <FormGroup>
          <ControlLabel required={required}>{label}</ControlLabel>
          {subtitle && <p>{__(subtitle)}</p>}
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
                placement="bottom-end"
                overlay={renderBoardSelect({
                  type: boardType,
                  stageId,
                  boardId,
                  pipelineId
                })}
                rootClose={true}
              >
                <IconWrap>
                  <Icon icon="cog" size={24} />
                </IconWrap>
              </OverlayTrigger>
            )}
          </FlexContent>
        </FormGroup>
      </div>
    );
  }

  const renderTaskPipelines = () => {
    const renderSelect = (
      options: IBoard[] | IPipeline[],
      handleSelect: (args: ISelectedOption) => void,
      value?: string
    ) => {
      return (
        <Select
          value={value}
          onChange={handleSelect}
          options={generateOptions(options, '_id', 'name')}
        />
      );
    };

    const handleSelectBoard = (option: ISelectedOption) => {
      const value = option ? option.value : '';

      if (value) {
        fetchPipelines(value);
      }

      handleFormChange('taskPublicBoardId', value);
    };

    const handleSelecPipeline = (option: ISelectedOption) => {
      const value = option ? option.value : '';

      handleFormChange('taskPublicPipelineId', value);
    };

    return (
      <>
        {renderControl({
          label: 'Public tasks',
          subtitle: 'Shown name on menu',
          formValueName: 'taskPublicLabel',
          formValue: taskPublicLabel,
          placeholder: 'Please enter a label for Public Task'
        })}
        <div>
          <FormGroup>
            <ControlLabel>Task public board</ControlLabel>
            <p>{__('Public task board')}</p>
            {renderSelect(boards, handleSelectBoard, taskPublicBoardId)}
          </FormGroup>
          <FormGroup>
            <ControlLabel>Task public pipeline</ControlLabel>
            <p>{__('Public task pipeline')}</p>
            {renderSelect(pipelines, handleSelecPipeline, taskPublicPipelineId)}
          </FormGroup>
        </div>
      </>
    );
  };

  const renderMain = () => {
    return (
      <Block>
        <h4>{__('Client portal')}</h4>
        <BlockRow>
          {renderControl({
            required: true,
            label: 'Client Portal Name',
            subtitle: 'Displayed in the header area',
            formValueName: 'name',
            formValue: name,
            formProps: {
              autoFocus: true
            }
          })}

          {renderControl({
            label: 'Description',
            subtitle: 'Displayed in the header area',
            className: 'description',
            formValueName: 'description',
            formValue: description
          })}

          {renderControl({
            label: 'Website',
            subtitle: 'Redirect URL to the main website',
            formValueName: 'url',
            formValue: url
          })}
        </BlockRow>
      </Block>
    );
  };

  const renderFeatureBlock = (
    title: string,
    childrens: any,
    toggleName: string,
    toggle: boolean
  ) => {
    return (
      <BlockRow>
        <BlockRowTitle>{__(title)}</BlockRowTitle>
        <ToggleWrap>
          <FormGroup>
            <ControlLabel>Show {title}</ControlLabel>
            <p>{__('Show in Client Portal')}</p>
            <Toggle
              checked={toggle}
              onChange={() => onChangeToggle(toggleName, !toggle)}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
        </ToggleWrap>
        <Features isToggled={toggle}>
          <BlockRow>{childrens}</BlockRow>
        </Features>
      </BlockRow>
    );
  };

  const renderFeatures = () => {
    if (
      !isEnabled('knowledgebase') &&
      !isEnabled('cards') &&
      !isEnabled('inbox')
    ) {
      return null;
    }
    return (
      <Block>
        <h4>{__('Features')}</h4>
        {isEnabled('knowledgebase') &&
          renderFeatureBlock(
            'knowledgeBase',
            <>
              {renderControl({
                label: 'Knowledge Base Name',
                subtitle: 'Shown name on menu',
                formValueName: 'knowledgeBaseLabel',
                formValue: knowledgeBaseLabel,
                placeholder: 'Please enter a label for Knowledge base'
              })}
              <FormGroup>
                <ControlLabel required={true}>
                  Knowledge base topic
                </ControlLabel>
                <p>{__('Knowledge base topic in Client Portal')}</p>
                <Select
                  placeholder="Select a knowledge base topic"
                  value={knowledgeBaseTopicId}
                  options={generateOptions(topics, '_id', 'title')}
                  onChange={handleSelectChange}
                />
              </FormGroup>
            </>,
            'kbToggle',
            kbToggle || false
          )}
        {isEnabled('cards') &&
          renderFeatureBlock(
            'publicTask',
            renderTaskPipelines(),
            'publicTaskToggle',
            publicTaskToggle || false
          )}

        {isEnabled('cards') &&
          renderFeatureBlock(
            'tickets',
            <>
              {renderControl({
                label: 'Tickets',
                subtitle: 'Shown name on menu',
                formValueName: 'ticketLabel',
                formValue: ticketLabel,
                placeholder: 'Please enter a label for Ticket'
              })}
              {renderBoardSelect({
                type: 'ticket',
                stageId: ticketStageId,
                pipelineId: ticketPipelineId,
                boardId: ticketBoardId
              })}
            </>,
            'ticketToggle',
            ticketToggle || false
          )}

        {isEnabled('cards') &&
          renderFeatureBlock(
            'deals',
            <>
              {renderControl({
                label: 'Deals',
                subtitle: 'Shown name on menu',
                formValueName: 'dealLabel',
                formValue: dealLabel,
                placeholder: 'Please enter a label for Deal'
              })}
              {renderBoardSelect({
                type: 'deal',
                stageId: dealStageId,
                pipelineId: dealPipelineId,
                boardId: dealBoardId
              })}
            </>,
            'dealToggle',
            dealToggle || false
          )}

        {isEnabled('cards') &&
          renderFeatureBlock(
            'purchases',
            <>
              {renderControl({
                label: 'Purchases',
                subtitle: 'Shown name on menu',
                formValueName: 'purchaseLabel',
                formValue: purchaseLabel,
                placeholder: 'Please enter a label for Purchase'
              })}
              {renderBoardSelect({
                type: 'purchase',
                stageId: purchaseStageId,
                pipelineId: purchasePipelineId,
                boardId: purchaseBoardId
              })}
            </>,
            'purchaseToggle',
            purchaseToggle || false
          )}

        {isEnabled('cards') &&
          renderFeatureBlock(
            'tasks',
            <>
              {renderControl({
                label: 'Tasks incoming pipeline',
                subtitle: 'Shown name on menu',
                formValueName: 'taskLabel',
                formValue: taskLabel,
                placeholder: 'Please enter a label for Task'
              })}
              {renderBoardSelect({
                type: 'task',
                stageId: taskStageId,
                pipelineId: taskPipelineId,
                boardId: taskBoardId
              })}
            </>,
            'taskToggle',
            taskToggle || false
          )}
        {isEnabled('inbox') &&
          renderControl({
            label: 'Messenger brand code',
            subtitle: 'Brand code in messenger install script',
            formValueName: 'messengerBrandCode',
            formValue: messengerBrandCode
          })}
      </Block>
    );
  };

  return (
    <>
      {renderMain()}
      {renderFeatures()}
    </>
  );
}

export default General;
