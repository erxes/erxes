import { Icon, Tip } from '@erxes/ui/src/components';
import React, { useEffect, useState } from 'react';
import { calculateTimeElapsed, getSpentTime } from '../../utils';
import { Td } from '../../styles';

type Props = {
  callList: any;
  isWaiting?: boolean;
};

export const Row = (props: Props) => {
  const { callList, isWaiting } = props;

  const [timeSpent, setTimeSpent] = useState(
    isWaiting
      ? calculateTimeElapsed(callList.starttime)
      : callList?.bridge_time
        ? calculateTimeElapsed(callList.bridge_time)
        : 0,
  );

  useEffect(() => {
    let timer;

    if (callList.bridge_time) {
      timer = setInterval(() => {
        const diff = calculateTimeElapsed(callList.bridge_time);
        setTimeSpent(diff);
      }, 1000);
    }
    if (callList.starttime) {
      timer = setInterval(() => {
        const diff = calculateTimeElapsed(callList.starttime);
        setTimeSpent(diff);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [callList]);

  return (
    <tr style={{ textAlign: 'left' }}>
      <Td fontWeight="bold">
        <Tip text={isWaiting ? 'Ringing' : 'Calling'} placement="bottom">
          <Icon
            icon="calling"
            size={20}
            color={isWaiting ? 'blue' : 'orange'}
          />
        </Tip>
      </Td>
      <Td fontWeight="bold">{callList.callerid || ''}</Td>
      {!isWaiting && <Td fontWeight="bold">{callList.calleeid}</Td>}
      <Td fontWeight="bold">{getSpentTime(timeSpent + 31)}</Td>
    </tr>
  );
};
