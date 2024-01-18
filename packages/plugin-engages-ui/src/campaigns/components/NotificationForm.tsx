import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import colors from '@erxes/ui/src/styles/colors';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import {
  IEngageScheduleDate,
  IEngageNotification
} from '@erxes/ui-engage/src/types';
import Scheduler from './Scheduler';
// import NotificationPreview from './NotificationPreview';

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
    name: 'shortMessage' | 'scheduleDate' | 'notification',
    value?: IEngageNotification | IEngageScheduleDate | IEngageNotification
  ) => void;
  messageKind: string;
  scheduleDate: IEngageScheduleDate;
  notification?: IEngageNotification;
};

type State = {
  scheduleDate: IEngageScheduleDate;
  characterCount: number;
  titleCount: number;
  message: string;
  title: string;
  isMobile: boolean;
};

class NotificationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      scheduleDate: props.scheduleDate,
      characterCount: this.calcCharacterCount(160, this.getContent('content')),
      titleCount: this.calcCharacterCount(15, this.getContent('title')),
      message: this.getContent('content'),
      title: this.getContent('title'),
      isMobile: this.getContent('isMobile') || false
    };
  }

  onChangeNotification = (key: string, value: string | boolean) => {
    const shortMessage = { ...this.props.notification } as IEngageNotification;
    shortMessage[key] = value;

    this.props.onChange('notification', shortMessage);
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

  render() {
    const { notification } = this.props;
    const { message, title, isMobile, titleCount, characterCount } = this.state;

    const onChangeTitle = e =>
      this.onChangeNotification('title', (e.target as HTMLInputElement).value);

    const onChangeContent = e =>
      this.onChangeNotification(
        'content',
        (e.target as HTMLInputElement).value
      );

    const onChangeIsMobile = e => {
      this.onChangeNotification(
        'isMobile',
        (e.target as HTMLInputElement).checked
      );
    };

    const onChangeTitleContent = e => {
      const title = (e.target as HTMLInputElement).value;

      this.setState({
        title: title,
        titleCount: this.calcCharacterCount(15, title)
      });
    };

    const onChangeNotificationContent = e => {
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
            <FlexInfo>
              <ControlLabel>{__('Notification title')}:</ControlLabel>
              <Char count={titleCount}>{titleCount}</Char>
            </FlexInfo>
            <FormControl
              onBlur={onChangeTitle}
              defaultValue={notification && notification.title}
              onChange={onChangeTitleContent}
              maxLength={15}
              required
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
              onChange={onChangeNotificationContent}
              maxLength={160}
              required
            />
          </FormGroup>

          <FormGroup horizontal>
            <FlexInfo>
              <ControlLabel>{__('Is mobile notification')}:</ControlLabel>
            </FlexInfo>
            <input
              onBlur={onChangeIsMobile}
              defaultChecked={notification?.isMobile || false}
              onChange={e => onChangeIsMobile(e)}
              type="checkbox"
            />
          </FormGroup>
          {this.renderScheduler()}
        </FlexPad>

        {/* <FlexItem overflow="auto" count="2">
          <NotificationPreview
            title={title}
            message={message}
            isMobile={isMobile}
          />
        </FlexItem> */}
      </FlexItem>
    );
  }
}

export default NotificationForm;
