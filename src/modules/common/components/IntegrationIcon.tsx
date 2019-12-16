import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IIntegration } from '../../settings/integrations/types';
import { darken } from '../styles/color';

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
    (props.type === 'facebook' && colors.socialFacebook) ||
    (props.type === 'facebook-messenger' && colors.socialFacebookMessenger) ||
    (props.type === 'gmail' && colors.socialGmail) ||
    (props.type.includes('nylas') && colors.socialGmail) ||
    colors.colorCoreBlue};

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
      case 'twitter-dm':
        icon = 'twitter';
        break;
      case 'messenger':
        icon = 'comment';
        break;
      case 'nylas-gmail':
        icon = 'mail-alt';
        break;
      case 'nylas-imap':
        icon = 'mail-alt';
        break;
      case 'nylas-office365':
        icon = 'mail-alt';
        break;
      case 'nylas-outlook':
        icon = 'mail-alt';
        break;
      case 'nylas-yahoo':
        icon = 'mail-alt';
        break;
      case 'gmail':
        icon = 'mail-alt';
        break;
      case 'callpro':
        icon = 'phone-call';
        break;
      case 'chatfuel':
        icon = 'comment-dots';
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
