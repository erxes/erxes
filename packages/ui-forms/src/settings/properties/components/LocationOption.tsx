import Button from '@erxes/ui/src/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { ILocationOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import {
  LogicItem,
  LogicRow,
  RowSmall
} from '@erxes/ui-forms/src/forms/styles';
import { Column } from '@erxes/ui/src/styles/main';

type Props = {
  onChangeOption: (option: ILocationOption, index: number) => void;
  option: ILocationOption;
  index: number;
  removeOption?: (index: number) => void;
};

function LocationOption(props: Props) {
  const { option, onChangeOption, removeOption, index } = props;

  const onChangeDescription = e => {
    option.description = e.target.value;
    onChangeOption(option, index);
  };

  const onChangeLat = e => {
    onChangeOption({ ...option, lat: Number(e.target.value) }, index);
  };

  const onChangeLng = e => {
    onChangeOption({ ...option, lng: Number(e.target.value) }, index);
  };

  const remove = () => {
    removeOption && removeOption(index);
  };

  return (
    <LogicItem>
      <LogicRow>
        <Column>
          <LogicRow>
            <RowSmall>
              <ControlLabel htmlFor="lat">{__('Latitude')}:</ControlLabel>
              <FormControl
                value={option.lat}
                name="lat"
                onChange={onChangeLat}
                type="number"
              />
            </RowSmall>
            <Column>
              <ControlLabel htmlFor="lng">{__('Longitude')}:</ControlLabel>
              <FormControl
                value={option.lng}
                name="lng"
                onChange={onChangeLng}
                type="number"
              />
            </Column>
          </LogicRow>
          <FormGroup>
            <ControlLabel htmlFor="description">
              {__('Description')}:
            </ControlLabel>
            <FormControl
              defaultValue={option.description}
              name="description"
              onChange={onChangeDescription}
            />
          </FormGroup>
        </Column>
        {removeOption && (
          <Button onClick={remove} btnStyle="danger" icon="times" />
        )}
      </LogicRow>
    </LogicItem>
  );
}

export default LocationOption;
