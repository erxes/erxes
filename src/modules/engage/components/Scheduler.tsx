import {
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { SCHEDULE_TYPES } from 'modules/engage/constants';
import * as React from 'react';
import * as Datetime from 'react-datetime';
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

  changeSchedule(key, value) {
    const scheduleDate = { ...this.state.scheduleDate };

    scheduleDate[key] = value;

    this.setState({ scheduleDate });

    this.props.onChange('scheduleDate', scheduleDate);
  }

  generateOptions(number) {
    const options: React.ReactNode[] = [];

    for (let i = 1; i <= number; i++) {
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

    return (
      <React.Fragment>
        <ControlLabel>Choose month:</ControlLabel>
        <FormControl
          componentClass="select"
          value={month}
          onChange={e =>
            this.changeSchedule('month', (e.target as HTMLInputElement).value)
          }
        >
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

    return (
      <React.Fragment>
        <ControlLabel>Choose day:</ControlLabel>
        <FormControl
          componentClass="select"
          value={day}
          onChange={e =>
            this.changeSchedule('day', (e.target as HTMLInputElement).value)
          }
        >
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

    return (
      <FormGroup>
        <ControlLabel>Schedule:</ControlLabel>
        <FormControl
          componentClass="select"
          value={type}
          onChange={e =>
            this.changeSchedule('type', (e.target as HTMLInputElement).value)
          }
        >
          <option />{' '}
          {SCHEDULE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {__(type.label)}
            </option>
          ))}
        </FormControl>

        <SelectMonth>
          {this.renderMonthSelector()}
          {this.renderDaySelector()}
        </SelectMonth>

        <DateTimePicker>
          <Datetime
            {...props}
            value={time}
            onChange={e => this.changeSchedule('time', e)}
            dateFormat={false}
            inputProps={{ placeholder: 'Click to choose time' }}
          />
          <Icon icon="calendar" />
        </DateTimePicker>
      </FormGroup>
    );
  }
}

export default Scheduler;
