import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import { IScheduleForm, IScheduleConfig } from '../../types';

type Props = {
  scheduleDates: IScheduleForm;
};
class CustomDateTime extends React.Component<Props> {
  shouldComponentUpdate(nextProps, nextState) {
    // Compare the current props and state with the next props and state
    // and return false if they are equal, to prevent the component from re-rendering unnecessarily
    if (this.props.scheduleDates === nextProps.scheduleDates) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <Datetime
        open={true}
        input={false}
        // renderDay={renderDay}
        closeOnSelect={false}
        timeFormat={false}
        onChange={onDateSelectChange}
        inputProps={{ required: false }}
      />
    );
  }
}
