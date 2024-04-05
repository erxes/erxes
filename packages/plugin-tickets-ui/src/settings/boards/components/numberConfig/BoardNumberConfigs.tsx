import React from 'react';
import { BOARD_NUMBERS } from '../../constants';
import Input from './Input';

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
  size: string;
};

function BoardNumber(props: Props) {
  const { config, size, onChange } = props;

  return (
    <Input
      onChange={onChange}
      attributions={BOARD_NUMBERS}
      config={config}
      size={size}
    />
  );
}

export default BoardNumber;
