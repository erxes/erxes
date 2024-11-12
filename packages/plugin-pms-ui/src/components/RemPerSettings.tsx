import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import BoardSelectContainer from '@erxes/ui-sales/src/boards/containers/BoardSelect';
import React, { useState } from 'react';
import { IConfigsMap } from '../types';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const { configsMap, currentConfigKey } = props;

  const onChangeBoard = (boardId: string) => {
    setConfig({ ...config, boardId });
  };

  const onChangePipeline = (pipelineId: string) => {
    setConfig({ ...config, pipelineId });
  };

  const onSave = e => {
    e.preventDefault();
    const key = config.pipelineId;

    delete configsMap.remainderConfig[currentConfigKey];
    configsMap.remainderConfig[key] = config;
    props.save(configsMap);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(props.currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderInput = (key: string, title?: string, description?: string) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === 'newremainderConfig' ? true : false}
    >
      <FormGroup>
        <ControlLabel>{'Title'}</ControlLabel>
        <FormControl
          defaultValue={config['title']}
          onChange={onChangeInput.bind(this, 'title')}
          required={true}
          autoFocus={true}
        />
      </FormGroup>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <BoardSelectContainer
              type='deal'
              autoSelectStage={false}
              boardId={config.boardId}
              pipelineId={config.pipelineId}
              stageId={config.stageId}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <ModalFooter>
        <Button
          btnStyle='simple'
          icon='cancel-1'
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle='primary'
          icon='check-circle'
          onClick={onSave}
          uppercase={false}
          disabled={config.pipelineId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default PerSettings;
