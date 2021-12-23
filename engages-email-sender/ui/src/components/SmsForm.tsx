import EmptyState from 'erxes-ui/lib/components/EmptyState';
import FormControl from 'erxes-ui/lib/components/form/Control';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { FlexItem, FlexPad } from 'erxes-ui/lib/components/step/styles';
import colors from 'erxes-ui/lib/styles/colors';
import { ISelectedOption } from 'erxes-ui/lib/types';
import { __ } from 'erxes-ui/lib/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import {
  IEngageScheduleDate,
  IEngageSms,
  IIntegrationWithPhone
} from '../types';
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
  fromUserId: string;
  smsConfig: any;
  integrations: IIntegrationWithPhone[];
};

type State = {
  scheduleDate: IEngageScheduleDate;
  characterCount: number;
  titleCount: number;
  message: string;
  title: string;
  fromIntegrationId: string;
};

type IOption = {
  value: string;
  label: string;
  phoneNumber: string;
  disabled: boolean;
};

class MessengerForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      scheduleDate: props.scheduleDate,
      characterCount: this.calcCharacterCount(160, this.getContent('content')),
      titleCount: this.calcCharacterCount(15, this.getContent('from')),
      message: this.getContent('content'),
      title: this.getContent('from'),
      fromIntegrationId: this.getContent('fromIntegrationId')
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
    const { integrations } = this.props;
    const options: IOption[] = [];

    integrations.map(i =>
      options.push({
        value: i._id,
        label: i.name,
        phoneNumber: i.phoneNumber,
        disabled: !i.isActive
      })
    );

    return options;
  };

  fromOptionRenderer = option => (
    <div>
      <strong>{option.label}</strong> (<i>{option.phoneNumber}</i>)
    </div>
  );

  render() {
    const { shortMessage, smsConfig } = this.props;
    const {
      message,
      title,
      titleCount,
      characterCount,
      fromIntegrationId
    } = this.state;

    const onChangeTitle = e =>
      this.onChangeSms('from', (e.target as HTMLInputElement).value);

    const onChangeContent = e =>
      this.onChangeSms('content', (e.target as HTMLInputElement).value);

    const onChangeFrom = (value: ISelectedOption) => {
      const integrationId = value ? value.value : '';

      this.setState({ fromIntegrationId: integrationId });
      this.onChangeSms('fromIntegrationId', integrationId);
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

    if (!smsConfig) {
      return (
        <EmptyState
          text="SMS integration is not configured. Go to Settings > System config > Integrations config and set Telnyx SMS API key."
          image="/images/actions/21.svg"
        />
      );
    }

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column" count="3">
          <FormGroup>
            <ControlLabel>From:</ControlLabel>
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
