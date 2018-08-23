import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import Datetime from 'react-datetime';
import { SCHEDULE_TYPES } from 'modules/engage/constants';

const contextTypes = {
  __: PropTypes.func
};

const propTypes = {
  scheduleDate: PropTypes.object,
  onChange: PropTypes.func
};

class SchedulerFrom extends Component {
  constructor(props) {
    super(props);

    const { scheduleDate = {} } = this.props;

    this.state = {
      scheduleDate: {
        type: scheduleDate.type || '',
        month: scheduleDate.month || '',
        day: scheduleDate.day || '',
        time: scheduleDate.time
      }
    };
  }

  changeSchedule(key, value) {
    let scheduleDate = {
      ...this.state.scheduleDate
    };

    scheduleDate[key] = value;

    this.setState({ scheduleDate });
    this.props.onChange('scheduleDate', scheduleDate);
  }

  generateOptions(number) {
    let options = [];

    for (let i = 1; i <= number; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    return options;
  }

  render() {
    const { __ } = this.context;
    const { type, day, month, time } = this.state.scheduleDate;

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
          onChange={e => this.changeSchedule('type', e.target.value)}
        >
          <option />{' '}
          {SCHEDULE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {__(type.label)}
            </option>
          ))}
        </FormControl>
        {type === 'year' ? (
          <FormControl
            componentClass="select"
            value={month}
            onChange={e => this.changeSchedule('month', e.target.value)}
          >
            <option /> {this.generateOptions(12)}
          </FormControl>
        ) : null}
        {type === 'year' || type === 'month' ? (
          <FormControl
            componentClass="select"
            value={day}
            onChange={e => this.changeSchedule('day', e.target.value)}
          >
            <option /> {this.generateOptions(31)}
          </FormControl>
        ) : null}
        <Datetime
          {...props}
          value={time}
          onChange={e => this.changeSchedule('time', e)}
          dateFormat={false}
        />
      </FormGroup>
    );
  }
}

SchedulerFrom.contextTypes = contextTypes;
SchedulerFrom.propTypes = propTypes;

export default SchedulerFrom;
