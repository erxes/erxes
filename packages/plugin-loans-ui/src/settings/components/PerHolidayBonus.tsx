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
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const { configsMap, currentConfigKey } = props;

  const onSave = (e) => {
    e.preventDefault();
    const key = Math.floor(Math.random() * 1000000000000000);

    delete configsMap.holidayConfig[currentConfigKey];
    configsMap.holidayConfig[key] = config;
    props.save(configsMap);
  };

  const onDelete = (e) => {
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

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === 'newEbarimtConfig' ? true : false}
    >
      <FormGroup>
        <ControlLabel>{__('Title')}</ControlLabel>
        <FormControl
          defaultValue={config['title']}
          onChange={onChangeInput.bind(this, 'title')}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{__('Month')}</ControlLabel>
        <FormControl
          defaultValue={config['month']}
          type={'number'}
          min={1}
          max={12}
          onChange={onChangeInput.bind(this, 'month')}
          required={true}
          autoFocus={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('Day')}</ControlLabel>
        <FormControl
          defaultValue={config['day']}
          type={'number'}
          min={1}
          max={31}
          onChange={onChangeInput.bind(this, 'day')}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          {__('Delete')}
        </Button>

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
export default PerSettings;
