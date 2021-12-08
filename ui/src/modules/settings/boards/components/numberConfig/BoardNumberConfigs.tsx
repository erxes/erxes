import React from 'react';
import { BOARD_NUMBERS } from '../../constants';
import Input from './Input';

type Props = {
  onChangeNumber: (value: string) => void;
  config: string;
};

function BoardNumber(props: Props) {
  const { config, onChangeNumber } = props;

  return (
    <Input
      label={'Number configuration'}
      onChange={onChangeNumber}
      attributions={BOARD_NUMBERS}
      config={config}
    />
  );
}

export default BoardNumber;
