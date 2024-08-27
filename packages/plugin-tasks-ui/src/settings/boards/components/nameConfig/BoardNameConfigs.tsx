import React from 'react';
import { BOARD_NAMES_CONFIGS } from '../../constants';
import Input from './Input';

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
};

function BoardNumber(props: Props) {
  const { config, onChange } = props;

  return (
    <Input
      onChange={onChange}
      attributions={BOARD_NAMES_CONFIGS}
      config={config}
    />
  );
}

export default BoardNumber;
