import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ICustomer } from '../../customers/types';
import { IConversationFacebookData, ITwitterData } from '../../inbox/types';
import { IIntegration } from '../../settings/integrations/types';

const RoundedBackground = styledTS<{ type: string; size?: number }>(
  styled.span
)`
  width: ${props => (props.size ? `${props.size}px` : '20px')};
  height: ${props => (props.size ? `${props.size}px` : '20px')};
  border-radius: ${props => (props.size ? `${props.size / 2}px` : '10px')};
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
    font-size: ${props => (props.size ? '18px' : '11px')};
    line-height: ${props => (props.size ? '38px' : '18px')};
  }

  img {
    max-width: 65%;
  }
`;

type Props = {
  customer: ICustomer;
  integration: IIntegration;
  facebookData?: IConversationFacebookData;
  twitterData?: ITwitterData;
  size?: number;
};

class IntegrationIcon extends React.Component<Props> {
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
    const { integration, size } = this.props;

    return (
      <RoundedBackground type={integration.kind} size={size}>
        <Icon icon={this.getIcon()} />
      </RoundedBackground>
    );
  }
}

export default IntegrationIcon;
