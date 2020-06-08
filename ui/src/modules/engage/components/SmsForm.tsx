import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IEngageScheduleDate } from '../types';
import Scheduler from './Scheduler';

type Props = {
  onChange: (
    name: 'smsContent' | 'scheduleDate' | 'fromUserId',
    value?: IEngageScheduleDate | string
  ) => void;
  users: IUser[];
  messageKind: string;
  fromUserId: string;
  scheduleDate: IEngageScheduleDate;
  smsContent?: string;
};

type State = {
  fromUserId: string;
  scheduleDate: IEngageScheduleDate;
};

class MessengerForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { fromUserId, scheduleDate } = props;

    this.state = { fromUserId, scheduleDate };
  }

  changeFromUserId = fromUserId => {
    this.setState({ fromUserId });
    this.props.onChange('fromUserId', fromUserId);
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
    const { onChange, smsContent, users } = this.props;

    const onChangeFrom = e =>
      this.changeFromUserId((e.target as HTMLInputElement).value);

    const onContentChange = e =>
      onChange('smsContent', (e.target as HTMLInputElement).value);

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column" count="3">
          <FormGroup>
            <ControlLabel>{__('Message:')}</ControlLabel>
            <FormControl
              componentClass="textarea"
              defaultValue={smsContent}
              onBlur={onContentChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={onChangeFrom}
              value={this.state.fromUserId}
            >
              <option />{' '}
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.details ? user.details.fullName : user.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderScheduler()}
        </FlexPad>
      </FlexItem>
    );
  }
}

export default MessengerForm;
