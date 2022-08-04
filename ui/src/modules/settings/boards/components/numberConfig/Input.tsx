import { BoardHeader } from 'modules/automations/styles';
import { FlexContent, FlexItem } from 'modules/layout/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import React from 'react';

import Attribution from './Attribution';
import { Alert } from 'modules/common/utils';

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
  size: string;
  attributions: any[];
};

function PlaceHolderInput(props: Props) {
  let { config } = props;
  const { size, onChange, attributions } = props;

  const onChangeNumber = (conf: string) => {
    if (8 < parseInt(conf, 10) || parseInt(conf, 10) < 1) {
      return Alert.error('Fractional part number must be from 1 to 8');
    }

    onChange('numberSize', conf);
  };

  const onChangeConfig = (conf: string) => {
    if (conf.startsWith(' ')) {
      return Alert.error(
        `Please make sure the number configuration doesn't start with a space`
      );
    }

    onChange('numberConfig', conf);
  };

  const renderAttribution = () => {
    return (
      <Attribution
        config={config}
        setConfig={conf => onChangeConfig(conf)}
        attributions={attributions}
      />
    );
  };

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();

      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      let chIndex = 0;
      let index = 0;

      const re = /{([^}]+)}|\w|\W|_/g;
      const value = target.value;

      const matches = value.match(re) || [];
      const by = {};

      for (const match of matches) {
        const len = match.length;
        const prevCh = chIndex;
        chIndex += len;

        by[index] = { min: prevCh + 1, max: chIndex };
        index += 1;
      }

      const deletes = Object.keys(by).filter(key => {
        const val = by[key];

        if (start === end && val.min < start && val.max < start) {
          return null;
        }

        if (start < end && val.min <= start && val.max <= start) {
          return null;
        }

        if (val.min > end && val.max > end) {
          return null;
        }

        return key;
      });

      config = matches.filter((_m, i) => !deletes.includes(String(i))).join('');

      onChangeConfig(config);
    }
  };

  // converted config
  const converted: string = config;

  return (
    <FlexContent>
      <FlexItem count={3}>
        <BoardHeader>
          <FormGroup>
            <div className="header-row">
              <ControlLabel>Number configuration</ControlLabel>
              <div>{renderAttribution()}</div>
            </div>
            <FormControl
              value={converted}
              onKeyPress={onKeyPress}
              onKeyDown={onKeyPress}
              onChange={(e: any) => onChangeConfig(e.target.value)}
              placeholder="Choose an attribute or any number you prefer"
            />
          </FormGroup>
        </BoardHeader>
      </FlexItem>
      <FlexItem count={1} hasSpace={true}>
        <FormGroup>
          <ControlLabel>Fractional part</ControlLabel>
          <FormControl
            type="number"
            onChange={(e: any) => onChangeNumber(e.target.value)}
            min={1}
            max={8}
            value={size}
            placeholder="1-8"
          />
        </FormGroup>
      </FlexItem>
    </FlexContent>
  );
}

export default PlaceHolderInput;
