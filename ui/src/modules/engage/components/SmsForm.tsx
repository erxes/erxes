import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IEngageScheduleDate, IEngageSms } from '../types';
import Scheduler from './Scheduler';
import SmsPreview from './SmsPreview';

const SMSInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Char = styledTS<{ count: number }>(styled.div)`
  color: ${props =>
    props.count > 10
      ? props.count < 30 && colors.colorCoreOrange
      : colors.colorCoreRed};
  font-weight: bold;
`;

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
  characterCount: number;
  titleCount: number;
  message: string;
  title: string;
};

class MessengerForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      scheduleDate: props.scheduleDate,
      characterCount: this.calcCharacterCount(160, this.getContent('content')),
      titleCount: this.calcCharacterCount(15, this.getContent('from')),
      message: this.getContent('content'),
      title: this.getContent('from')
    };
  }

  onChangeSms = (key: string, value: string) => {
    const shortMessage = { ...this.props.shortMessage } as IEngageSms;

    shortMessage[key] = value;

    this.props.onChange('shortMessage', shortMessage);
  };

  getContent(key: string) {
    const { shortMessage } = this.props;

    if (!shortMessage) {
      return '';
    }

    return shortMessage[key];
  }

  calcCharacterCount(maxChar: number, character?: string) {
    if (!character) {
      return maxChar;
    }

    return maxChar - character.length;
  }

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
    const { message, title, titleCount, characterCount } = this.state;

    const onChangeTitle = e =>
      this.onChangeSms('from', (e.target as HTMLInputElement).value);

    const onChangeContent = e =>
      this.onChangeSms('content', (e.target as HTMLInputElement).value);

    const onChangeFrom = e =>
      onChange('fromUserId', (e.target as HTMLInputElement).value);

    const onChangeFromContent = e => {
      const from = (e.target as HTMLInputElement).value;
      this.setState({
        title: from,
        titleCount: this.calcCharacterCount(15, from)
      });
    };

    const onChangeSmsContent = e => {
      const content = (e.target as HTMLInputElement).value;
      this.setState({
        message: content,
        characterCount: this.calcCharacterCount(160, content)
      });
    };

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
            <SMSInfo>
              <ControlLabel>Title:</ControlLabel>
              <Char count={titleCount}>{titleCount}</Char>
            </SMSInfo>
            <FormControl
              onBlur={onChangeTitle}
              defaultValue={shortMessage && shortMessage.from}
              onChange={onChangeFromContent}
              maxLength={15}
            />
          </FormGroup>
          <FormGroup>
            <SMSInfo>
              <ControlLabel>{__('Message:')}</ControlLabel>
              <Char count={characterCount}>{characterCount}</Char>
            </SMSInfo>
            <FormControl
              componentClass="textarea"
              defaultValue={shortMessage && shortMessage.content}
              onBlur={onChangeContent}
              onChange={onChangeSmsContent}
              // sms part max size
              maxLength={160}
            />
          </FormGroup>
          {this.renderScheduler()}
        </FlexPad>

        <FlexItem overflow="auto" count="2">
          <SmsPreview title={title} message={message} />
        </FlexItem>
      </FlexItem>
    );
  }
}

export default MessengerForm;
