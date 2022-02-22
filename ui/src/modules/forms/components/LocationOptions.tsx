import { FormGroup } from 'erxes-ui';
import Icon from 'modules/common/components/Icon';
import { ILocationOption } from 'modules/settings/properties/types';
import { LinkButton } from 'modules/settings/team/styles';
import React, { useEffect, useState } from 'react';
import LocationOption from './LocationOption';

type Props = {
  onChange: (value: ILocationOption[]) => void;
  locationOptions: ILocationOption[];
};

function LocationOptions(props: Props) {
  const { locationOptions, onChange } = props;

  const [options, setOptions] = useState(
    (locationOptions || []).map(({ description, lat, lng }) => {
      return {
        description,
        lat,
        lng
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
    setOptions([
      ...options,
      {
        lat: 0.0,
        lng: 0.0,
        description: ''
      }
    ]);
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
