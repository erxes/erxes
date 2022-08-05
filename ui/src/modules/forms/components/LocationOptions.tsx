import Icon from 'modules/common/components/Icon';
import { IField } from 'modules/settings/properties/types';
import { LinkButton } from 'modules/settings/team/styles';
import React, { useEffect, useState } from 'react';
import LocationOption from './LocationOption';

type Props = {
  onFieldChange: (name: string, value: any) => void;
  currentField: IField;
};

function LocationOptions(props: Props) {
  const { currentField, onFieldChange } = props;

  const [options, setOptions] = useState(
    (currentField.locationOptions || []).map(({ description, lat, lng }) => {
      return {
        description,
        lat,
        lng
      };
    })
  );

  useEffect(() => {
    onFieldChange('locationOptions', options);
  }, [options, onFieldChange]);

  const onChangeOption = (option, index) => {
    // find current editing one
    const currentOption = options.find((l, i) => i === index);

    // set new value
    if (currentOption) {
      options[index] = option;
    }

    setOptions(options);
    onFieldChange('locationOptions', options);
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

      <LinkButton onClick={addOption}>
        <Icon icon="plus-1" /> Add option
      </LinkButton>
    </>
  );
}

export default LocationOptions;
