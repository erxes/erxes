import {
  Button,
  DateControl,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
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

    delete configsMap.undueConfig[currentConfigKey];
    configsMap.undueConfig[key] = config;
    props.save(configsMap);
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(currentConfigKey);
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
      open={currentConfigKey === 'newEbarimtConfig' ? true : false}
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
        <ControlLabel>{__('Start Date')}</ControlLabel>
        <DateContainer>
          <DateControl
            name="startDate"
            value={config['startDate']}
            onChange={onChangeDate.bind(this, 'startDate')}
          />
        </DateContainer>
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__('End Date')}</ControlLabel>
        <DateContainer>
          <DateControl
            name="endDate"
            value={config['endDate']}
            onChange={onChangeDate.bind(this, 'endDate')}
          />
        </DateContainer>
      </FormGroup>

      <FormGroup>
        <ControlLabel>{__('Percent')}</ControlLabel>
        <FormControl
          defaultValue={config['percent']}
          type="number"
          min={0}
          max={100}
          onChange={onChangeInput.bind(this, 'percent')}
          required={true}
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
