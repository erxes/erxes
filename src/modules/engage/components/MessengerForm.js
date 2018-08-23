import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';
import Datetime from 'react-datetime';
import {
  MESSENGER_KINDS,
  SENT_AS_CHOICES,
  SCHEDULE_TYPES
} from 'modules/engage/constants';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Editor from './Editor';
import { MessengerPreview } from '../containers';

const contextTypes = {
  __: PropTypes.func
};

const propTypes = {
  brands: PropTypes.array,
  changeMessenger: PropTypes.func,
  users: PropTypes.array,
  hasKind: PropTypes.bool,
  defaultValue: PropTypes.object,
  kind: PropTypes.string
};

class MessengerForm extends Component {
  constructor(props) {
    super(props);

    const message = props.defaultValue || {};

    this.state = {
      fromUser: message.fromUser || '',
      messenger: {
        brandId: message.messenger.brandId || '',
        kind: message.messenger.kind || '',
        sentAs: message.messenger.sentAs || ''
      },
      scheduleDate: {
        type: message.scheduleDate.type || '',
        month: message.scheduleDate.month || '',
        day: message.scheduleDate.day || '',
        time: message.scheduleDate.time
      }
    };
  }

  changeSchedule(key, value) {
    let scheduleDate = {
      ...this.state.scheduleDate
    };

    scheduleDate[key] = value;
    this.setState({ scheduleDate });
    this.props.changeMessenger('scheduleDate', scheduleDate);
  }

  changeContent(key, value) {
    let messenger = {
      ...this.state.messenger
    };

    messenger[key] = value;
    this.setState({ messenger });
    this.props.changeMessenger('messenger', messenger);
  }

  changeUser(fromUser) {
    this.setState({ fromUser });
    this.props.changeMessenger('fromUser', fromUser);
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

  renderKind(hasKind) {
    if (!hasKind) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Message type:</ControlLabel>

        <FormControl
          componentClass="select"
          onChange={e => this.changeContent('kind', e.target.value)}
          defaultValue={this.state.messenger.kind}
        >
          <option />{' '}
          {MESSENGER_KINDS.SELECT_OPTIONS.map(k => (
            <option key={k.value} value={k.value}>
              {k.text}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  renderScheduler() {
    if (this.props.kind !== 'auto') {
      return null;
    }

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

  render() {
    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column">
          <FormGroup>
            <ControlLabel>Message:</ControlLabel>
            <Editor
              onChange={this.props.changeMessenger}
              defaultValue={this.props.defaultValue.message}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeUser(e.target.value)}
              value={this.state.fromUser}
            >
              <option />{' '}
              {this.props.users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName || u.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Brand:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeContent('brandId', e.target.value)}
              defaultValue={this.state.messenger.brandId}
            >
              <option />{' '}
              {this.props.brands.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderKind(this.props.hasKind)}

          <FormGroup>
            <ControlLabel>Sent as:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeContent('sentAs', e.target.value)}
              defaultValue={this.state.messenger.sentAs}
            >
              <option />{' '}
              {SENT_AS_CHOICES.SELECT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.text}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderScheduler()}
        </FlexPad>

        <FlexPad overflow="auto">
          <MessengerPreview
            sentAs={this.state.messenger.sentAs}
            content={this.props.defaultValue.message}
            fromUser={this.state.fromUser}
          />
        </FlexPad>
      </FlexItem>
    );
  }
}

MessengerForm.contextTypes = contextTypes;
MessengerForm.propTypes = propTypes;

export default MessengerForm;
