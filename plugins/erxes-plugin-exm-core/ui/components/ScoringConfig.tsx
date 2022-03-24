import Button from 'erxes-ui/lib/components/Button';
import { FlexItem } from 'erxes-ui/lib/layout/styles';
import { FormControl, FormGroup } from 'erxes-ui/lib/components/form';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { __ } from 'erxes-ui/lib/utils';
import React, { useState } from 'react';
import {
  GeneralWrapper,
  AppearanceWrapper,
  ScoringConfigContent
} from '../styles';
import { IExm } from '../types';
import { CONFIG_OPTIONS } from '../constants';

const getEmptyContent = () => ({
  _id: Math.random().toString(),
  action: CONFIG_OPTIONS[0].value,
  score: 0
});

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

export default function ScoringConfig(props: Props) {
  const { exm, edit } = props;
  const exmScoringConfig = exm.scoringConfig || [];

  const [scoringConfig, setScoringConfig] = useState(
    exmScoringConfig.length > 0
      ? exmScoringConfig.map(config => ({
          action: config.action,
          score: config.score
        }))
      : []
  );

  const onSave = () => {
    edit({
      _id: props.exm._id,
      scoringConfig
    });
  };

  const onChangeConfig = (type: string, _id?: string) => {
    if (type === 'add') {
      setScoringConfig([...scoringConfig, getEmptyContent()]);
    } else {
      const modifiedConfigs = scoringConfig.filter(f => f._id !== _id);

      setScoringConfig(modifiedConfigs);
    }
  };

  const onChangeConfigItem = (_id: string, key: string, value: any) => {
    const config = scoringConfig.find(f => f._id === _id);

    if (config) {
      config[key] = value;

      setScoringConfig([...scoringConfig]);
    }
  };

  const renderScoringConfig = (config, index: number) => {
    return (
      <div key={index}>
        <button
          style={{ float: 'right' }}
          onClick={() => onChangeConfig('remove', config._id)}
        >
          X
        </button>
        <ControlLabel>
          <b>Config {index + 1}</b>
        </ControlLabel>
        <div style={{ display: 'flex' }}>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Action</ControlLabel>
              <FormControl
                name="action"
                componentClass="select"
                value={config.action}
                options={CONFIG_OPTIONS}
                onChange={(e: any) => {
                  onChangeConfigItem(config._id, 'action', e.target.value);
                }}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem>
            <FormGroup>
              <ControlLabel>Score</ControlLabel>
              <FormControl
                name="score"
                placeholder="Score"
                type="number"
                value={config.score}
                onChange={(e: any) => {
                  return onChangeConfigItem(
                    config._id,
                    'score',
                    parseInt(e.target.value, 10)
                  );
                }}
              />
            </FormGroup>
          </FlexItem>
        </div>
      </div>
    );
  };

  return (
    <AppearanceWrapper>
      <GeneralWrapper>
        <ScoringConfigContent>
          <p>Scoring config</p>
          <Button onClick={() => onChangeConfig('add')}>+ Add Config</Button>
          {scoringConfig.map((config, index) =>
            renderScoringConfig(config, index)
          )}
        </ScoringConfigContent>
        <Button btnStyle="success" onClick={onSave}>
          Save
        </Button>
      </GeneralWrapper>
    </AppearanceWrapper>
  );
}
