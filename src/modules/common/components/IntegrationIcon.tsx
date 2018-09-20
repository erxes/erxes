import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import React, { Component } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const RoundedBackground = styledTS<{ type: string }>(styled.span)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  text-align: center;
  display: flex;
  justify-content: center;
  border: 1px solid ${colors.colorWhite};
  background: ${props =>
    (props.type === 'form' && colors.colorCoreYellow) ||
    (props.type === 'messenger' && colors.colorSecondary) ||
    (props.type === 'twitter' && colors.socialTwitter) ||
    (props.type === 'facebook' && colors.socialFacebook) ||
    colors.colorSecondary};

  i {
    color: ${colors.colorWhite};
    font-size: 11px;
    line-height: 18px;
  }

  img {
    max-width: 65%;
  }
`;

type Props = {
  customer: any;
  integration: any;
  facebookData?: any;
  twitterData?: any;
};

class IntegrationIcon extends Component<Props> {
  getIcon() {
    const { integration, customer, facebookData, twitterData } = this.props;

    let icon;
    switch (integration.kind) {
      case 'facebook':
        icon =
          facebookData && facebookData.kind === 'feed'
            ? 'facebook-logo'
            : 'facebook-messenger-logo';
        break;
      case 'twitter':
        icon =
          twitterData && twitterData.isDirectMessage ? 'twitter' : 'arroba';
        break;
      case 'messenger':
        icon = customer.isUser ? 'chat' : 'speech-bubble-2';
        break;
      default:
        icon = 'file';
    }
    return icon;
  }

  render() {
    const { integration } = this.props;

    return (
      <RoundedBackground type={integration.kind}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default IntegrationIcon;
