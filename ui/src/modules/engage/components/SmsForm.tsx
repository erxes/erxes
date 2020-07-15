import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import colors from 'modules/common/styles/colors';
import { ISelectedOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
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

  fromSelectOptions = () => {
    const { users } = this.props;
    const options: any[] = [];

    users.map(user =>
      options.push({
        value: user._id,
        label: user.details && user.details.operatorPhone,
        name: (user.details && user.details.fullName) || user.username,
        disabled: !(user.details && user.details.operatorPhone)
      })
    );

    return options;
  };

  fromOptionRenderer = option => (
    <div>
      <strong>{option.name}</strong> <i>{option.label}</i>
    </div>
  );

  render() {
    const { fromUserId, onChange, shortMessage } = this.props;
    const { message, title, titleCount, characterCount } = this.state;

    const onChangeTitle = e =>
      this.onChangeSms('from', (e.target as HTMLInputElement).value);

    const onChangeContent = e =>
      this.onChangeSms('content', (e.target as HTMLInputElement).value);

    const onChangeFrom = (value: ISelectedOption) => {
      const userId = value ? value.value : '';
      onChange('fromUserId', userId);
    };

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
            <Select
              placeholder={__('Choose user')}
              value={fromUserId}
              onChange={onChangeFrom}
              options={this.fromSelectOptions()}
              optionRenderer={this.fromOptionRenderer}
            />
          </FormGroup>
          <FormGroup>
            <SMSInfo>
              <ControlLabel>{__('SMS marketing from the title')}:</ControlLabel>
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
              <ControlLabel>{__('SMS marketing content')}:</ControlLabel>
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
