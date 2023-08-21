import { IIntegration } from '../../integrations/types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { colors } from '@erxes/ui/src/styles';
import { darken } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const RoundedBackground = styledTS<{ type: string; size?: number }>(
  styled.span
)`
  width: ${props => (props.size ? `${props.size}px` : '20px')};
  height: ${props => (props.size ? `${props.size}px` : '20px')};
  border-radius: ${props => (props.size ? `${props.size / 2}px` : '11px')};
  text-align: center;
  display: flex;
  justify-content: center;
  line-height: ${props => (props.size ? `${props.size - 1}px` : '20px')};
  background: ${props =>
    (props.type === 'lead' && darken(colors.colorCoreYellow, 32)) ||
    (props.type === 'messenger' && colors.colorCoreBlue) ||
    (props.type === 'twitter-dm' && colors.socialTwitter) ||
    (props.type === 'facebook-post' && colors.socialFacebook) ||
    (props.type === 'facebook-messenger' && colors.socialFacebookMessenger) ||
    (props.type === 'gmail' && colors.socialGmail) ||
    (props.type === 'whatsapp' && colors.socialWhatsApp) ||
    (props.type.includes('nylas') && colors.socialGmail) ||
    (props.type.includes('telegram') && colors.socialTelegram) ||
    (props.type.includes('viber') && colors.socialViber) ||
    (props.type.includes('line') && colors.socialLine) ||
    (props.type.includes('twilio') && colors.socialTwilio) ||
    colors.colorCoreRed};
  i {
    color: ${colors.colorWhite};
    font-size: ${props => (props.size ? `${props.size / 2}px` : '11px')};
  }
  img {
    max-width: 65%;
  }
`;

type Props = {
  integration: IIntegration;
  size?: number;
};

class IntegrationIcon extends React.PureComponent<Props> {
  getIcon() {
    const { integration } = this.props;

    let icon;
    switch (integration.kind) {
      case 'facebook-messenger':
        icon = 'messenger';
        break;
      case 'facebook-post':
        icon = 'facebook';
        break;
      case 'messenger':
        icon = 'comment';
        break;
      case 'callpro':
        icon = 'phone-volume';
        break;
      case 'viber':
        icon = 'viber';
        break;
      default:
        icon = 'doc-text-inv-1';
    }
    return icon;
  }

  render() {
    const { integration, size } = this.props;

    return (
      <RoundedBackground type={integration.kind} size={size}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default IntegrationIcon;
