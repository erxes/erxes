import React from 'react';
import { BOARD_NUMBERS } from '../../constants';
import Input from './Input';

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
  count: string;
};

function BoardNumber(props: Props) {
  const { config, count, onChange } = props;

  return (
    <Input
      onChange={onChange}
      attributions={BOARD_NUMBERS}
      config={config}
      count={count}
    />
  );
}

export default BoardNumber;
