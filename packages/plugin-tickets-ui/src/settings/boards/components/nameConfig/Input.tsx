import {
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components/form';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';

import { Alert } from '@erxes/ui/src/utils';
import Attribution from './Attribution';
import { BoardHeader } from '@erxes/ui-tasks/src/settings/boards/styles';
import React from 'react';

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
  attributions: any[];
};

function PlaceHolderInput(props: Props) {
  let { config } = props;
  const { onChange, attributions } = props;

  const onChangeConfig = (conf: string) => {
    if (conf.startsWith(' ')) {
      return Alert.error(
        `Please make sure the number configuration doesn't start with a space`
      );
    }

    onChange('nameConfig', conf);
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
            <div className='header-row'>
              <ControlLabel>Name configuration</ControlLabel>
              <div>{renderAttribution()}</div>
            </div>
            <FormControl
              value={converted}
              onChange={(e: any) => onChangeConfig(e.target.value)}
              placeholder='Choose an attribute or any number you prefer'
            />
          </FormGroup>
        </BoardHeader>
      </FlexItem>
    </FlexContent>
  );
}

export default PlaceHolderInput;
