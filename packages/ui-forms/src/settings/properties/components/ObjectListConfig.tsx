import Button from '@erxes/ui/src/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { IObjectListConfig } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import {
  LogicItem,
  LogicRow,
  RowSmall
} from '@erxes/ui-forms/src/forms/styles';
import { Column } from '@erxes/ui/src/styles/main';

type Props = {
  onChangeOption: (option: IObjectListConfig, index: number) => void;
  option: IObjectListConfig;
  index: number;
  removeOption: (index: number) => void;
};

function LocationOption(props: Props) {
  const { option, onChangeOption, removeOption, index } = props;

  const onChangeType = e => {
    option.type = e.target.value;
    onChangeOption(option, index);
  };

  const onChangeKey = e => {
    option.key = e.target.value;
    onChangeOption(option, index);
  };

  const onChangeLabel = e => {
    option.label = e.target.value;
    onChangeOption(option, index);
  };

  const remove = () => {
    removeOption(index);
  };

  return (
    <LogicItem>
      <LogicRow>
        <Column>
          <LogicRow>
            <RowSmall>
              <ControlLabel>{__('Key')}:</ControlLabel>
              <FormControl
                value={option.key}
                name="key"
                onChange={onChangeKey}
              />
            </RowSmall>
            <RowSmall>
              <Column>
                <ControlLabel>{__('Label')}:</ControlLabel>
                <FormControl
                  value={option.label}
                  name="label"
                  onChange={onChangeLabel}
                />
              </Column>
            </RowSmall>
            <RowSmall>
              <Column>
                <ControlLabel>{__('Type')}:</ControlLabel>
                <FormControl
                  value={option.type}
                  name="type"
                  componentClass="select"
                  onChange={onChangeType}
                >
                  <option key="text" value="text">
                    {__('Text')}
                  </option>
                  <option key="textarea" value="textarea">
                    {__('Text Area')}
                  </option>
                </FormControl>
              </Column>
            </RowSmall>
          </LogicRow>
        </Column>
        <Button onClick={remove} btnStyle="danger" icon="times" />
      </LogicRow>
    </LogicItem>
  );
}

export default LocationOption;
