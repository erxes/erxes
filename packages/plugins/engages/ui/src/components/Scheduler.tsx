import FormControl from 'erxes-ui/lib/components/form/Control';
import DateControl from 'erxes-ui/lib/components/form/DateControl';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { DateContainer } from 'erxes-ui/lib/styles/main';
import { __ } from 'erxes-ui/lib/utils';
import { SCHEDULE_TYPES } from '../constants';
import React from 'react';
import { SelectMonth } from '../styles';
import { IEngageScheduleDate } from '../types';

type Props = {
  scheduleDate: IEngageScheduleDate;
  onChange: (name: 'scheduleDate', value?: IEngageScheduleDate) => void;
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
    let scheduleDate = this.state.scheduleDate
      ? { ...this.state.scheduleDate }
      : null;

    if (key === 'type' && !value) {
      scheduleDate = null;
    }

    if (scheduleDate) {
      scheduleDate[key] = value;
    }

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
    const { type, month } = this.state.scheduleDate || { type: '', month: '' };

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
    const { type, day } = this.state.scheduleDate || { type: '', day: '' };

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

  renderDateTimeSelector() {
    const schedule = this.state.scheduleDate || {
      type: 'pre',
      dateTime: ''
    };

    if (schedule.type === undefined) {
      schedule.type = 'pre';
    }

    if (schedule.type !== 'pre') {
      return null;
    }

    const onChange = e => {
      this.changeSchedule('dateTime', e);
    };

    return (
      <React.Fragment>
        <ControlLabel>Choose date:</ControlLabel>
        <DateContainer>
          <DateControl
            dateFormat="YYYY/MM/DD"
            timeFormat={true}
            required={false}
            name="dateTime"
            value={schedule.dateTime}
            placeholder={'Date time'}
            onChange={onChange}
          />
        </DateContainer>
      </React.Fragment>
    );
  }

  render() {
    const { type } = this.state.scheduleDate || { type: '' };

    const onChange = e =>
      this.changeSchedule('type', (e.target as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Schedule:</ControlLabel>
        <FormControl componentClass="select" value={type} onChange={onChange}>
          {SCHEDULE_TYPES.map(scheduleType => (
            <option key={scheduleType.value} value={scheduleType.value}>
              {__(scheduleType.label)}
            </option>
          ))}
        </FormControl>

        <SelectMonth>
          {this.renderMonthSelector()}
          {this.renderDaySelector()}
          {this.renderDateTimeSelector()}
        </SelectMonth>
      </FormGroup>
    );
  }
}

export default Scheduler;
