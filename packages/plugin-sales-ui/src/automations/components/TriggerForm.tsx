import { Button, ControlLabel, FormGroup, __ } from '@erxes/ui/src';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import BoardSelect from '@erxes/ui-sales/src/boards/containers/BoardSelect';
import { ITrigger } from '@erxes/ui-segments/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { useState } from 'react';
import Select from 'react-select';
import { PROBABILITY } from '../../settings/boards/constants';

const PROBABILITY_DEAL = PROBABILITY.deal.ALL.map(p => ({
  value: p,
  label: p,
}));

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

type Config = {
  probability?: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
};

export default function TriggerForm({
  closeModal,
  addConfig,
  activeTrigger,
}: Props) {
  const [config, setConfig] = useState<Config>(activeTrigger?.config || {});

  const onChangeConfig = (name: string, value: any) => {
    setConfig({ ...config, [name]: value });
  };

  const onSave = () => {
    addConfig(activeTrigger, activeTrigger.id, {
      ...(activeTrigger?.config || {}),
      ...config,
    });
    closeModal();
  };

  return (
    <DrawerDetail>
      <FormGroup>
        <ControlLabel required>{__('Probability')}</ControlLabel>
        <Select
          options={PROBABILITY_DEAL}
          value={PROBABILITY_DEAL.find(
            ({ value }) => config?.probability === value
          )}
          onChange={option => onChangeConfig('probability', option?.value)}
        />
      </FormGroup>
      <BoardSelect
        type="deal"
        boardId={config?.boardId || ''}
        pipelineId={config?.pipelineId || ''}
        stageId={config?.stageId || ''}
        onChangeBoard={boardId => onChangeConfig('boardId', boardId)}
        onChangePipeline={pipelineId =>
          onChangeConfig('pipelineId', pipelineId)
        }
        onChangeStage={stageId => onChangeConfig('stageId', stageId)}
        autoSelectStage
        isOptional
      />
      <ModalFooter>
        <Button btnStyle="simple" onClick={closeModal}>
          {__('Cancel')}
        </Button>
        <Button
          btnStyle="success"
          disabled={!config?.probability}
          onClick={onSave}
        >
          {__('Save')}
        </Button>
      </ModalFooter>
    </DrawerDetail>
  );
}
