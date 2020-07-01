import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IEngageScheduleDate, IEngageSms } from '../types';
import Scheduler from './Scheduler';

type Props = {
  onChange: (
    name: 'shortMessage' | 'scheduleDate' | 'fromUserId',
    value?: IEngageScheduleDate | IEngageSms | string
  ) => void;
  messageKind: string;
  scheduleDate: IEngageScheduleDate;
  shortMessage?: IEngageSms;
  users: IUser[];
  fromUserId: string;
};

type State = {
  scheduleDate: IEngageScheduleDate;
};

class MessengerForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { scheduleDate: props.scheduleDate };
  }

  onChangeSms = (key: string, value: string) => {
    const shortMessage = { ...this.props.shortMessage } as IEngageSms;

    shortMessage[key] = value;

    this.props.onChange('shortMessage', shortMessage);
  };

  renderScheduler() {
    const { messageKind, onChange } = this.props;

    if (messageKind === 'manual') {
      return null;
    }

    return (
      <Scheduler
        scheduleDate={this.state.scheduleDate || ({} as IEngageScheduleDate)}
        onChange={onChange}
      />
    );
  }

  render() {
    const { fromUserId, onChange, shortMessage, users } = this.props;

    const onChangeTitle = e =>
      this.onChangeSms('from', (e.target as HTMLInputElement).value);

    const onChangeContent = e =>
      this.onChangeSms('content', (e.target as HTMLInputElement).value);

    const onChangeFrom = e =>
      onChange('fromUserId', (e.target as HTMLInputElement).value);

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column" count="3">
          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={onChangeFrom}
              defaultValue={fromUserId}
            >
              <option />{' '}
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.details ? user.details.fullName : user.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Title:</ControlLabel>
            <FormControl
              onBlur={onChangeTitle}
              defaultValue={shortMessage && shortMessage.from}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Message:')}</ControlLabel>
            <FormControl
              componentClass="textarea"
              defaultValue={shortMessage && shortMessage.content}
              onBlur={onChangeContent}
              // sms part max size
              max={160}
            />
          </FormGroup>
          {this.renderScheduler()}
        </FlexPad>
      </FlexItem>
    );
  }
}

export default MessengerForm;
