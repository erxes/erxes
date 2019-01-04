import { Icon } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IConversationFacebookData } from '../../inbox/types';
import { IIntegration } from '../../settings/integrations/types';
import { darken } from '../styles/color';

const RoundedBackground = styledTS<{ type: string; size?: number }>(
  styled.span
)`
  width: ${props => (props.size ? `${props.size}px` : '22px')};
  height: ${props => (props.size ? `${props.size}px` : '22px')};
  border-radius: ${props => (props.size ? `${props.size / 2}px` : '11px')};
  text-align: center;
  display: flex;
  justify-content: center;
  border: 1px solid ${colors.colorWhite};
  background: ${props =>
    (props.type === 'form' && darken(colors.colorCoreYellow, 32)) ||
    (props.type === 'messenger' && colors.colorPrimary) ||
    (props.type === 'twitter' && colors.socialTwitter) ||
    (props.type === 'facebook' && colors.socialFacebook) ||
    (props.type === 'gmail' && colors.socialGmail) ||
    colors.colorSecondary};

  i {
    color: ${colors.colorWhite};
    font-size: ${props => (props.size ? '18px' : '11px')};
    line-height: ${props => (props.size ? '38px' : '20px')};
  }

  img {
    max-width: 65%;
  }
`;

type Props = {
  integration: IIntegration;
  facebookData?: IConversationFacebookData;
  size?: number;
};

class IntegrationIcon extends React.PureComponent<Props> {
  getIcon() {
    const { integration, facebookData } = this.props;

    let icon;
    switch (integration.kind) {
      case 'facebook':
        icon =
          facebookData && facebookData.kind === 'feed'
            ? 'facebook-1'
            : 'messenger';
        break;
      case 'twitter':
        icon = 'twitter-1';
        break;
      case 'messenger':
        icon = 'comment';
        break;
      case 'gmail':
        icon = 'mail-alt';
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
