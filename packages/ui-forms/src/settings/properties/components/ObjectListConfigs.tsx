import { FormGroup } from '@erxes/ui/src';
import Icon from '@erxes/ui/src/components/Icon';
import { IObjectListConfig } from '@erxes/ui/src/types';
import { LinkButton } from '@erxes/ui/src/styles/main';
import React, { useEffect, useState } from 'react';
import ObjectListConfig from './ObjectListConfig';

type Props = {
  onChange: (value: IObjectListConfig[]) => void;
  objectListConfigs: IObjectListConfig[];
  currentLocation?: IObjectListConfig;
};

function ObjectListConfigs(props: Props) {
  const { objectListConfigs, currentLocation, onChange } = props;

  const [options, setOptions] = useState(
    (objectListConfigs || []).map(({ key, label, type }) => {
      return {
        key,
        label,
        type
      };
    })
  );

  useEffect(() => {
    onChange(options);
  }, [options, onChange]);

  const onChangeOption = (option, index) => {
    // find current editing one
    const currentOption = options.find((l, i) => i === index);

    // set new value
    if (currentOption) {
      options[index] = option;
    }

    setOptions(options);
    onChange(options);
  };

  const addOption = () => {
    const option: any = currentLocation || {
      key: '',
      label: '',
      type: 'text'
    };

    setOptions([...options, option]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((l, i) => i !== index));
  };

  return (
    <>
      {options.map((option, index) => (
        <ObjectListConfig
          key={index}
          option={option}
          onChangeOption={onChangeOption}
          removeOption={removeOption}
          index={index}
        />
      ))}
      <FormGroup>
        <LinkButton onClick={addOption}>
          <Icon icon="plus-1" /> Add option
        </LinkButton>
      </FormGroup>
    </>
  );
}

export default ObjectListConfigs;
