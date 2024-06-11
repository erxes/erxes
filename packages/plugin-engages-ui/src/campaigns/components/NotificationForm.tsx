import { IEngageNotification } from '@erxes/ui-engage/src/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import colors from '@erxes/ui/src/styles/colors';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import NotificationPreview from './NotificationPreview';

const FlexInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const Char = styledTS<{ count: number }>(styled.div)`
  color: ${props =>
    props.count > 10
      ? props.count < 30 && colors.colorCoreOrange
      : colors.colorCoreRed};
  font-weight: bold;
`;

const CheckBox = styledTS<{ active?: boolean }>(styled.div)`
  border: 1px solid;
  border-color: ${props => (props.active ? colors.colorPrimary : '#ddd')};
  color: ${props =>
    props.active ? colors.colorPrimary : colors.colorCoreGray};
    background: ${props =>
      props.active ? rgba(colors.colorPrimary, 0.1) : '#fff'};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  position: relative;
  margin-top: 0.5rem;
  transition: all 0.3s ease-in-out;
  flex: 1;
  input {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    left: 0;
    top: 0;
  }
   svg {
    height: 30px;
    width: 26px;
    object-fit: contain;
    display: block;
    margin: 0 auto 0.5rem;
    path{
      transition: fill 0.3s ease-in-out;
      fill: ${props => (props.active ? colors.colorPrimary : '#9CA3AF')};
    }
  }
`;

type Props = {
  onChange: (
    name: 'shortMessage' | 'notification',
    value?: IEngageNotification | IEngageNotification
  ) => void;
  messageKind: string;
  notification?: IEngageNotification;
};

type State = {
  characterCount: number;
  titleCount: number;
  message: string;
  title: string;
  isMobile: boolean;
  isWebPush: boolean;
};

class NotificationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      characterCount: this.calcCharacterCount(160, this.getContent('content')),
      titleCount: this.calcCharacterCount(15, this.getContent('title')),
      message: this.getContent('content'),
      title: this.getContent('title'),
      isMobile: this.getContent('isMobile') || false,
      isWebPush: this.getContent('isWebPush') || false,
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

  render() {
    const { notification } = this.props;
    const { message, title, titleCount, characterCount } = this.state;

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
        titleCount: this.calcCharacterCount(15, title),
      });
    };

    const onChangeNotificationContent = e => {
      const content = (e.target as HTMLInputElement).value;
      this.setState({
        message: content,
        characterCount: this.calcCharacterCount(160, content),
      });
    };

    return (
      <FlexItem>
        <FlexPad overflow='auto' direction='column' count='3'>
          <FormGroup>
            <FlexInfo>
              <ControlLabel>
                {__('Choose your notification type')}:
              </ControlLabel>
            </FlexInfo>
            <FlexInfo>
              <CheckBox active={true}>
                <svg
                  width='40'
                  height='33'
                  viewBox='0 0 40 33'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M37.875 1.5625C38.125 2.0625 37.9375 2.6875 37.4375 2.9375L33.4375 4.9375C32.9375 5.1875 32.3125 5 32.0625 4.5C31.8125 4 32 3.375 32.5 3.125L36.5 1.125C37 0.875 37.625 1.0625 37.875 1.5625ZM19 2C19 1.5 19.4375 1 20 1C20.5 1 21 1.5 21 2V3.0625C26 3.5625 30 7.8125 30 13V14.875C30 17.5625 31.0625 20.1875 33 22.125L33.1875 22.3125C33.6875 22.8125 34 23.5 34 24.25C34 25.8125 32.75 27 31.1875 27H8.75C7.1875 27 6 25.8125 6 24.25C6 23.5 6.25 22.8125 6.75 22.3125L6.9375 22.125C8.875 20.1875 10 17.5625 10 14.875V13C10 7.8125 13.9375 3.5625 19 3.0625V2ZM20 5C15.5625 5 12 8.625 12 13V14.875C12 18.125 10.6875 21.25 8.375 23.5625L8.1875 23.6875C8.0625 23.875 8 24.0625 8 24.25C8 24.6875 8.3125 25 8.75 25H31.1875C31.625 25 32 24.6875 32 24.25C32 24.0625 31.875 23.875 31.75 23.6875L31.5625 23.5625C29.25 21.25 28 18.125 28 14.875V13C28 8.625 24.375 5 19.9375 5H20ZM20 31C20.8125 31 21.5625 30.5 21.875 29.6875C22.0625 29.1875 22.625 28.875 23.125 29.0625C23.625 29.25 23.9375 29.8125 23.75 30.375C23.1875 31.9375 21.6875 33 20 33C18.25 33 16.75 31.9375 16.1875 30.375C16 29.8125 16.3125 29.25 16.8125 29.0625C17.3125 28.875 17.875 29.1875 18.0625 29.6875C18.375 30.5 19.125 31 20 31ZM0 12C0 11.5 0.4375 11 1 11H6C6.5 11 7 11.5 7 12C7 12.5625 6.5 13 6 13H1C0.4375 13 0 12.5625 0 12ZM39 11C39.5 11 40 11.5 40 12C40 12.5625 39.5 13 39 13H34C33.4375 13 33 12.5625 33 12C33 11.5 33.4375 11 34 11H39ZM2.5 2.9375C2 2.6875 1.8125 2.0625 2.0625 1.5625C2.3125 1.0625 2.9375 0.875 3.4375 1.125L7.4375 3.125C7.9375 3.375 8.125 4 7.875 4.5C7.625 5 7 5.1875 6.5 4.9375L2.5 2.9375Z' />
                </svg>
                <input type='checkbox' defaultChecked={true} />
                <span>{__('In-app push notification')}</span>
              </CheckBox>
              <CheckBox active={notification?.isMobile}>
                <svg
                  width='20'
                  height='32'
                  viewBox='0 0 20 32'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M10 27.5C9.125 27.5 8.5 26.875 8.5 26C8.5 25.1875 9.125 24.5 10 24.5C10.8125 24.5 11.5 25.1875 11.5 26C11.5 26.875 10.8125 27.5 10 27.5ZM16 0C18.1875 0 20 1.8125 20 4V28C20 30.25 18.1875 32 16 32H4C1.75 32 0 30.25 0 28V4C0 1.8125 1.75 0 4 0H16ZM18 28V22H2V28C2 29.125 2.875 30 4 30H16C17.0625 30 18 29.125 18 28ZM18 20V4C18 2.9375 17.0625 2 16 2H4C2.875 2 2 2.9375 2 4V20H18Z' />
                </svg>

                <input
                  type='checkbox'
                  onBlur={onChangeIsMobile}
                  defaultChecked={notification?.isMobile || false}
                  onChange={e => onChangeIsMobile(e)}
                />
                <span> {__('Mobile & Web push notification')}</span>
              </CheckBox>
              {/* <CheckBox active={isWebPush}>
                <svg
                  width="32"
                  height="28"
                  viewBox="0 0 32 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 4C0 1.8125 1.75 0 4 0H28C30.1875 0 32 1.8125 32 4V24C32 26.25 30.1875 28 28 28H4C1.75 28 0 26.25 0 24V4ZM10 6H30V4C30 2.9375 29.0625 2 28 2H10V6ZM8 2H4C2.875 2 2 2.9375 2 4V6H8V2ZM2 8V24C2 25.125 2.875 26 4 26H28C29.0625 26 30 25.125 30 24V8H2Z" />
                </svg>
                <input
                  type="checkbox"
                  onBlur={onChangeIsWebPush}
                  defaultChecked={false}
                  onChange={(e) => onChangeIsWebPush(e)}
                />
                <span>{__('Web push notification')}</span>
              </CheckBox> */}
            </FlexInfo>
          </FormGroup>
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
              componentclass='textarea'
              defaultValue={notification && notification.content}
              onBlur={onChangeContent}
              onChange={onChangeNotificationContent}
              maxLength={160}
              required
            />
          </FormGroup>
        </FlexPad>

        <FlexItem overflow='auto' count='2'>
          <NotificationPreview
            title={title}
            message={message}
            isMobile={this.getContent('isMobile')}
            isWebPush={this.state.isWebPush}
          />
        </FlexItem>
      </FlexItem>
    );
  }
}

export default NotificationForm;
