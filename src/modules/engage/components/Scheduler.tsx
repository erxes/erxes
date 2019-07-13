import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { SCHEDULE_TYPES } from 'modules/engage/constants';
import React from 'react';
import Datetime from 'react-datetime';
import { DateTimePicker, SelectMonth } from '../styles';
import { IEngageScheduleDate } from '../types';

type Props = {
  scheduleDate: IEngageScheduleDate;
  onChange: (name: 'scheduleDate', value: IEngageScheduleDate) => void;
};

type State = {
  scheduleDate: IEngageScheduleDate;
};

class Scheduler extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { scheduleDate: props.scheduleDate };
  }

  changeSchedule = (key, value) => {
    const scheduleDate = { ...this.state.scheduleDate };

    scheduleDate[key] = value;

    this.setState({ scheduleDate });

    this.props.onChange('scheduleDate', scheduleDate);
  };

  generateOptions(length) {
    const options: React.ReactNode[] = [];

    for (let i = 1; i <= length; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    return options;
  }

  renderMonthSelector() {
    const { type, month } = this.state.scheduleDate;

    if (type !== 'year') {
      return null;
    }

    const onChange = e =>
      this.changeSchedule('month', (e.target as HTMLInputElement).value);

    return (
      <React.Fragment>
        <ControlLabel>Choose month:</ControlLabel>
        <FormControl componentClass="select" value={month} onChange={onChange}>
          <option /> {this.generateOptions(12)}
        </FormControl>
      </React.Fragment>
    );
  }

  renderDaySelector() {
    const { type, day } = this.state.scheduleDate;

    if (type !== 'year' && type !== 'month') {
      return null;
    }

    const onChange = e =>
      this.changeSchedule('day', (e.target as HTMLInputElement).value);

    return (
      <React.Fragment>
        <ControlLabel>Choose day:</ControlLabel>
        <FormControl componentClass="select" value={day} onChange={onChange}>
          <option /> {this.generateOptions(31)}
        </FormControl>
      </React.Fragment>
    );
  }

  render() {
    const { type, time } = this.state.scheduleDate;

    const props = {
      inputProps: { placeholder: __('Click to select a date') },
      timeFormat: 'HH:mm'
    };

    const onChange = e =>
      this.changeSchedule('type', (e.target as HTMLInputElement).value);
    const onChangeSchedule = e => this.changeSchedule('time', e);

    return (
      <FormGroup>
        <ControlLabel>Schedule:</ControlLabel>
        <FormControl componentClass="select" value={type} onChange={onChange}>
          <option />{' '}
          {SCHEDULE_TYPES.map(scheduleType => (
            <option key={scheduleType.value} value={scheduleType.value}>
              {__(scheduleType.label)}
            </option>
          ))}
        </FormControl>

        <SelectMonth>
          {this.renderMonthSelector()}
          {this.renderDaySelector()}
        </SelectMonth>

        <DateTimePicker>
          <ControlLabel>Choose time:</ControlLabel>
          <Datetime
            {...props}
            value={time}
            onChange={onChangeSchedule}
            dateFormat={false}
            input={false}
          />
        </DateTimePicker>
      </FormGroup>
    );
  }
}

export default Scheduler;
