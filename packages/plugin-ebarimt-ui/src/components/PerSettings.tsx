import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from '@erxes/ui/src/components';

import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { DISTRICTS } from '../constants';
import { IConfigsMap } from '../types';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import React, { useState } from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings: React.FC<Props> = (props: Props) => {
  const { config, configsMap, currentConfigKey, save } = props;
  const [state, setState] = useState({ config: config });

  const onChangeBoard = (boardId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, boardId };

      return {
        config: updatedConfig
      };
    });
  };

  const onChangePipeline = (pipelineId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, pipelineId };

      return {
        config: updatedConfig
      };
    });
  };

  const onChangeStage = (stageId: string) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, stageId };

      return {
        config: updatedConfig
      };
    });
  };

  const onSave = e => {
    e.preventDefault();
    const key = state.config.stageId;

    delete configsMap.stageInEbarimt[currentConfigKey];
    configsMap.stageInEbarimt[key] = state.config;
    save(configsMap);
  };

  const onDelete = e => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const onChangeConfig = (code: string, value) => {
    setState(prevState => {
      const updatedConfig = { ...prevState.config, [code]: value };

      return {
        config: updatedConfig
      };
    });
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
          defaultValue={state.config[key]}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  const renderCheckbox = (
    key: string,
    title?: string,
    description?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={state.config[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  return (
    <CollapseContent
      title={__(state.config.title)}
      transparent={true}
      beforeTitle={<Icon icon="settings" />}
      open={currentConfigKey === 'newEbarimtConfig' ? true : false}
    >
      <FormGroup>
        <ControlLabel>{'Title'}</ControlLabel>
        <FormControl
          defaultValue={state.config['title']}
          onChange={onChangeInput.bind(this, 'title')}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Destination Stage</ControlLabel>
        <BoardSelectContainer
          type="deal"
          autoSelectStage={false}
          boardId={state.config.boardId}
          pipelineId={state.config.pipelineId}
          stageId={state.config.stageId}
          onChangeBoard={onChangeBoard}
          onChangePipeline={onChangePipeline}
          onChangeStage={onChangeStage}
        />
      </FormGroup>
      {renderInput('companyName', 'companyName', 'optional')}
      {renderInput('userEmail', 'userEmail', '')}

      <FormGroup>
        <ControlLabel>{__('Provice/District')}</ControlLabel>
        <FormControl
          componentClass="select"
          defaultValue={state.config.districtName}
          options={DISTRICTS}
          onChange={onChangeInput.bind(this, 'districtName')}
          required={true}
        />
      </FormGroup>

      {renderInput('companyRD', 'companyRD', '')}
      {renderInput('vatPercent', 'vatPercent', '')}
      {renderInput('cityTaxPercent', 'cityTaxPercent', '')}
      {renderInput('defaultGSCode', 'defaultGSCode', '')}

      {renderCheckbox('hasVat', 'has Vat', '')}
      {renderCheckbox('hasCitytax', 'has Citytax', '')}
      {renderCheckbox(
        'skipPutData',
        'skip Ebarimt',
        'When checked only  print inner bill'
      )}

      <ModalFooter>
        <Button
          btnStyle="danger"
          icon="times-circle"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="success"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={state.config.stageId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default PerSettings;
