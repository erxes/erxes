import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import colors from '@erxes/ui/src/styles/colors';
import { ISelectedOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import {
  IEngageScheduleDate,
  IEngageNotification,
  IIntegrationWithPhone
} from '@erxes/ui-engage/src/types';
import Scheduler from './Scheduler';
import SmsPreview from './SmsPreview';
import { IConfig } from '@erxes/ui-settings/src/general/types';

const FlexInfo = styled.div`
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
    value?: IEngageScheduleDate | IEngageNotification | string
  ) => void;
  messageKind: string;
  scheduleDate: IEngageScheduleDate;
  notification?: IEngageNotification;
  fromUserId: string;
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

class NotificationForm extends React.Component<Props, State> {
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
    const shortMessage = { ...this.props.notification } as IEngageNotification;

    shortMessage[key] = value;

    this.props.onChange('shortMessage', shortMessage);
  };

  getContent(key: string) {
    const { notification } = this.props;

    if (!notification) {
      return '';
    }

    return notification[key];
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
    const { notification } = this.props;
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

    const onChangeIsMobile = e => {
      const isMobile = (e.target as HTMLInputElement).value;
      console.log('isMobile', isMobile);
      this.onChangeSms('isMobile', isMobile);
    };

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column" count="3">
          <FormGroup>
            <FlexInfo>
              <ControlLabel>{__('Notification title')}:</ControlLabel>
              <Char count={titleCount}>{titleCount}</Char>
            </FlexInfo>
            <FormControl
              onBlur={onChangeTitle}
              defaultValue={notification && notification.from}
              onChange={onChangeFromContent}
              maxLength={15}
            />
          </FormGroup>
          <FormGroup>
            <FlexInfo>
              <ControlLabel>{__('Notification content')}:</ControlLabel>
              <Char count={characterCount}>{characterCount}</Char>
            </FlexInfo>
            <FormControl
              componentClass="textarea"
              defaultValue={notification && notification.content}
              onBlur={onChangeContent}
              onChange={onChangeSmsContent}
              maxLength={160}
            />
          </FormGroup>
          <FormGroup>
            <FlexInfo>
              <ControlLabel>{__('Is mobile notification')}:</ControlLabel>
            </FlexInfo>
            <FormControl
              // onBlur={onChangeTitle}
              defaultValue={notification && notification.isMobile}
              onChange={onChangeFromContent}
              type="checkbox"
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

export default NotificationForm;
