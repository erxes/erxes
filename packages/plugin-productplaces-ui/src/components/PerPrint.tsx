import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { IConfigsMap } from '../types';
import PerPrintConditions from './PerPrintConditions';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerPrintSettings = (props: Props) => {
  const { configsMap, currentConfigKey, save } = props;
  const [config, setConfig] = useState(props.config);
  const [conditions, setconditions] = useState(props.config.conditions || []);

  const onChangeBoard = (boardId: string) => {
    setConfig({ ...config, boardId });
  };

  const onChangePipeline = (pipelineId: string) => {
    setConfig({ ...config, pipelineId });
  };

  const onChangeStage = (stageId: string) => {
    setConfig({ ...config, stageId });
  };

  const onSave = (e) => {
    e.preventDefault();
    const key = config.stageId;

    delete configsMap.dealsProductsDataPrint[currentConfigKey];
    configsMap.dealsProductsDataPrint[key] = config;
    save(configsMap);
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig({ ...config });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const addCondition = () => {
    conditions.push({
      id: Math.random().toString(),
    });
    setconditions(conditions);
    onChangeConfig('conditions', conditions);
  };

  const renderConditions = () => {
    const remove = (id) => {
      setconditions(conditions.filter((c) => c.id !== id));
      onChangeConfig(
        'conditions',
        conditions.filter((c) => c.id !== id),
      );
    };

    const editCondition = (id, condition) => {
      const updated = (conditions || []).map((c) =>
        c.id === id ? condition : c,
      );
      setconditions(updated);
      onChangeConfig('conditions', updated);
    };

    return (conditions || []).map((c) => (
      <PerPrintConditions
        key={c.id}
        condition={c}
        onChange={editCondition}
        onRemove={remove}
      />
    ));
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={currentConfigKey === 'newPrintConfig' ? true : false}
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
              type="deal"
              autoSelectStage={false}
              boardId={config.boardId}
              pipelineId={config.pipelineId}
              stageId={config.stageId}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeStage}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>

      {renderConditions()}
      <ModalFooter>
        <Button
          btnStyle="primary"
          onClick={addCondition}
          icon="plus"
          uppercase={false}
        >
          Add condition
        </Button>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={config.stageId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default PerPrintSettings;
