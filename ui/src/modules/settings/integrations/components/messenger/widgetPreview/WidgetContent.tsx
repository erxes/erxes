import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import { IMessagesItem, ISkillData } from 'modules/settings/integrations/types';
import React from 'react';
import {
  CallButtons,
  ErxesAvatar,
  ErxesDate,
  ErxesFromCustomer,
  ErxesMessage,
  ErxesMessageSender,
  ErxesMessagesList,
  ErxesSpacialMessage,
  FromCustomer,
  SkillWrapper,
  VideoCallRequestWrapper
} from './styles';

type Props = {
  color: string;
  textColor: string;
  wallpaper: string;
  isOnline?: boolean;
  skillData?: ISkillData;
  activeStep?: string;
  showVideoCallRequest?: boolean;
  message?: IMessagesItem;
};

class WidgetContent extends React.Component<Props, { skillResponse?: string }> {
  constructor(props) {
    super(props);

    this.state = {
      skillResponse: ''
    };
  }
  onSkillClick = skill => {
    this.setState({ skillResponse: skill.response && skill.response });
  };

  renderMessage = msg => {
    if (!msg) {
      return null;
    }

    return <ErxesSpacialMessage>{msg}</ErxesSpacialMessage>;
  };

  renderVideoCall() {
    const { showVideoCallRequest, color, activeStep } = this.props;

    if (!showVideoCallRequest || activeStep !== 'default') {
      return null;
    }

    return (
      <VideoCallRequestWrapper color={color}>
        <h5>{__('Audio and video call')}</h5>
        <p>{__('You can contact the operator by voice or video!')}</p>
        <CallButtons color={color}>
          <Button icon="phone-call">{__('Audio call')}</Button>
          <Button icon="videocamera">{__('Video call')}</Button>
        </CallButtons>
      </VideoCallRequestWrapper>
    );
  }

  renderSkills() {
    const { activeStep, color, skillData } = this.props;

    if (
      !skillData ||
      (Object.keys(skillData) || []).length === 0 ||
      !skillData.options ||
      activeStep !== 'intro'
    ) {
      return null;
    }

    if (this.state.skillResponse) {
      return (
        <SkillWrapper>
          <FromCustomer>{this.state.skillResponse}</FromCustomer>
        </SkillWrapper>
      );
    }

    return (
      <SkillWrapper color={color}>
        {(skillData.options || []).map((skill, index) => {
          if (!skill.label) {
            return null;
          }

          return (
            <Button onClick={this.onSkillClick.bind(this, skill)} key={index}>
              {skill.label}
            </Button>
          );
        })}
      </SkillWrapper>
    );
  }

  render() {
    const { color, wallpaper, message, isOnline, textColor } = this.props;

    const backgroundClasses = `background-${wallpaper}`;

    return (
      <>
        <ErxesMessagesList className={backgroundClasses}>
          {isOnline && this.renderMessage(message && message.welcome)}
          {this.renderSkills()}
          {this.renderVideoCall()}
          <li>
            <ErxesAvatar>
              <img src="/images/avatar-colored.svg" alt="avatar" />
            </ErxesAvatar>
            <ErxesMessage>{__('Hi, any questions?')}</ErxesMessage>
            <ErxesDate>{__('1 hour ago')}</ErxesDate>
          </li>
          <ErxesFromCustomer>
            <FromCustomer style={{ backgroundColor: color, color: textColor }}>
              {__('We need your help!')}
            </FromCustomer>
            <ErxesDate>{__('6 minutes ago')}</ErxesDate>
          </ErxesFromCustomer>
          {!isOnline && this.renderMessage(message && message.away)}
        </ErxesMessagesList>

        <ErxesMessageSender>
          <span>{__('Send a message')} ...</span>
        </ErxesMessageSender>
      </>
    );
  }
}

export default WidgetContent;
