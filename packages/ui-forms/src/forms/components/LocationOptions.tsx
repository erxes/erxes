import Icon from '@erxes/ui/src/components/Icon';
import { ILocationOption } from '@erxes/ui/src/types';
import { LinkButton } from '@erxes/ui/src/styles/main';
import React, { useEffect, useState } from 'react';
import LocationOption from './LocationOption';
import FormGroup from '@erxes/ui/src/components/form/Group';

type Props = {
  onChange: (value: ILocationOption[]) => void;
  locationOptions: ILocationOption[];
  currentLocation?: ILocationOption;
};

function LocationOptions(props: Props) {
  const { locationOptions, currentLocation, onChange } = props;

  const [options, setOptions] = useState(
    (locationOptions || []).map(({ lat, lng, description }) => {
      return {
        lat,
        lng,
        description
      };
    })
  );

  useEffect(() => {
    onChange(options);
  }, [options, onChange]);
  const onChangeOption = (option, index) => {
    setOptions(prevOptions => {
      const newOptions = [...prevOptions];
      newOptions[index] = option;
      onChange(newOptions);
      return newOptions;
    });
  };
  const addOption = () => {
    const option: any = currentLocation || {
      lat: 0.0,
      lng: 0.0,
      description: ''
    };

    setOptions([...options, option]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((l, i) => i !== index));
  };

  return (
    <>
      {options.map((option, index) => (
        <LocationOption
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

export default LocationOptions;
