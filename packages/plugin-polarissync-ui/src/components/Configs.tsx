import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
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
  POLARIS_API_URL: 'Polaris API URL'
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
      <CollapseContent
        transparent={true}
        title="Polaris configs"
        beforeTitle={<Icon icon="star" />}
      >
        {renderItem('POLARIS_API_URL')}
      </CollapseContent>
    </>
  );
};

export default Config;
