import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Icon from '@erxes/ui/src/components/Icon';
import React, { useState } from 'react';
import { __ } from '@erxes/ui/src/utils/core';

const KEY_LABELS = {
  ZALO_APP_ID: 'ZALO APP ID',
  ZALO_APP_SECRET_KEY: 'ZALO App APP SECRET KEY',
};

type Props = {
  loading: boolean;
  updateConfigs: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const Settings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const onChangeConfig = (code: string, value) => {
    configsMap[code] = value;

    setConfigsMap(configsMap);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderItem = (
    key: string,
    type?: string,
    description?: string,
    defaultValue?: string,
    label?: string,
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{label || KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          type={type || 'text'}
          defaultValue={configsMap[key] || defaultValue}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const onClick = () => {
    props.updateConfigs(configsMap);
  };

  return (
    <CollapseContent
      title="Zalo"
      beforeTitle={<Icon icon="comment-alt-1" />}
      transparent={true}
    >
      {renderItem('ZALO_APP_ID')}
      {renderItem('ZALO_APP_SECRET_KEY')}
      <Button onClick={onClick}>{__('Save')}</Button>
    </CollapseContent>
  );
};

export default Settings;
