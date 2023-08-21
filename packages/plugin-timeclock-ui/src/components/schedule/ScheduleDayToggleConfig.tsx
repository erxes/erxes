import React from 'react';
import { FormControl } from '@erxes/ui/src/components/form';

type Props = {
  toggleWeekDays: (dayKey: string) => void;
  weekDay: string;
};

const ScheduleConfig = (props: Props) => {
  const { toggleWeekDays, weekDay } = props;

  const toggleWeekDay = () => {
    toggleWeekDays(weekDay);
  };
  return (
    <>
      <FormControl componentClass="checkbox" onChange={toggleWeekDay} />
      <div>{weekDay}</div>
    </>
  );
};

export default ScheduleConfig;
