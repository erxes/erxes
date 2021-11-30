import React from 'react';
import { BOARD_NUMBERS } from '../../constants';
import { IConfigsMap } from '../../types';
import Input from './Input';

type Props = {
  onChangeConfig: (code: string, value) => void;
  configsMap: IConfigsMap;
};

function BoardNumber(props: Props) {
  const { onChangeConfig, configsMap } = props;

  const onChange = async (code: string, option) => {
    onChangeConfig(code, {
      [code]: option[code]
    });
  };

  const renderField = (inputName: string, label: string) => {
    return (
      <Input
        inputName={inputName}
        label={label}
        onChange={option => onChange(inputName, option)}
        triggerType={'skip query'}
        attributions={BOARD_NUMBERS}
        config={configsMap[inputName]}
      />
    );
  };

  return (
    <>
      {renderField('ticketNumber', 'ticket')}
      {renderField('taskNumber', 'task')}
      {renderField('dealNumber', 'deal')}
      {renderField('growthNumber', 'growth')}
    </>
  );
}

export default BoardNumber;
