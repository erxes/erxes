import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  onChangeConfig: (code: string, value: any) => void;
  configsMap: IConfigsMap;
};

const KEY_LABELS = {
  ORCHARD_API_URL: 'Orchard API URL',
  ORCHARD_USERNAME: 'Username',
  ORCHARD_PASSWORD: 'Password'
};

const Config = (props: Props) => {
  const { onChangeConfig, configsMap } = props;

  const onChange = e => {
    const { name, value } = e.target;
    onChangeConfig(name, value);
  };

  const renderItem = (
    key: string,
    description?: string,
    componentClass?: string,
    type?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          id={key}
          name={key}
          componentClass={componentClass}
          defaultValue={configsMap[key]}
          onChange={onChange}
          type={type}
        />
      </FormGroup>
    );
  };

  return (
    <>
      <CollapseContent title="Orchard API">
        {renderItem('ORCHARD_API_URL')}
        {renderItem('ORCHARD_USERNAME')}
        {renderItem('ORCHARD_PASSWORD', '', '', 'password')}
      </CollapseContent>
    </>
  );
};

export default Config;
