import { colors } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ICustomer } from '../../customers/types';
import { IConversationFacebookData, ITwitterData } from '../../inbox/types';
import { IIntegration } from '../../settings/integrations/types';

const SvgBackground = styledTS<{ type: string }>(styled.span)`
  width: 20px;
  height: 20px;
	justify-content: center;
	margin-left: 5px;

  img {
    max-width: 70%;
  }
`;

type Props = {
  customer: ICustomer;
  integration: IIntegration;
  facebookData?: IConversationFacebookData;
  twitterData?: ITwitterData;
};

class SvgIcon extends React.Component<Props> {
  renderSVG() {
    const { integration, customer, facebookData, twitterData } = this.props;

    let src;
    switch (integration.kind) {
      case 'facebook':
        src =
          facebookData && facebookData.kind === 'feed'
            ? 'facebook.svg'
            : 'messenger.svg';
        break;
      case 'twitter':
        src =
          twitterData && twitterData.isDirectMessage
            ? 'twitter1.svg'
            : 'twitter.svg';
        break;
      case 'messenger':
        src = customer.isUser ? 'chat.svg' : 'chat2.svg';
        break;
      default:
        src = 'form.svg';
    }
    return src;
  }

  render() {
    const { integration } = this.props;

    return (
      <SvgBackground type={integration.kind}>
        <img src={`/images/icons/${this.renderSVG()}`} alt={integration.kind} />
      </SvgBackground>
    );
  }
}

export default SvgIcon;
