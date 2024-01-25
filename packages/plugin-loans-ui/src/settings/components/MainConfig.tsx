import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import React, { useState } from 'react';
import { IConfigsMap } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
};

const MainConfig = (props: Props) => {
  const [config, setConfig] = useState(props.config || {});
  const { configsMap } = props;

  const onSave = (e) => {
    e.preventDefault();
    configsMap.loansConfig = config;
    props.save(configsMap);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeDate = (code: string, value) => {
    onChangeConfig(code, value);
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === 'newEbarimtConfig' ? true : false}
    >
      <FormGroup>
        <ControlLabel required={true}>{__('Organization type')}</ControlLabel>
        <FormControl
          name="organizationType"
          componentClass="select"
          defaultValue={config['organizationType']}
          onChange={onChangeInput.bind(this, 'organizationType')}
        >
          {['bbsb', 'entity'].map((typeName, index) => (
            <option key={index} value={typeName}>
              {__(typeName)}
            </option>
          ))}
        </FormControl>
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('Calculation number fixed')}</ControlLabel>
        <FormControl
          defaultValue={config['calculationFixed']}
          type="number"
          min={0}
          max={100}
          onChange={onChangeInput.bind(this, 'calculationFixed')}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('Display number fixed')}</ControlLabel>
        <FormControl
          defaultValue={config['displayFixed']}
          type="number"
          min={0}
          max={100}
          onChange={onChangeInput.bind(this, 'displayFixed')}
          required={true}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
        >
          {__('Save')}
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};
export default MainConfig;
