import React from 'react';
import PropTypes from 'prop-types';
import { keyframes } from 'styled-components';
import CommonPreview from './CommonPreview';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import {
  WidgetPreviewStyled,
  LogoContainer,
  LogoSpan
} from 'modules/settings/styles';

const slideright = keyframes`
  0% {
    transform: translateX(-20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const ShoutBox = MessengerPreview.extend`
  background: url(${props => !props.data && '/images/previews/preview.png'});
  height: 100%;
  min-height: 470px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: auto;
  margin-left: 0;
`;

const WidgetPreview = WidgetPreviewStyled.extend`
  width: 100%;
  max-height: 100%;
`;

const Widget = Messenger.extend`
  animation: ${slideright} 0.5s linear;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.3) 60%,
    #eee 100%
  );
`;

const propTypes = {
  theme: PropTypes.string,
  color: PropTypes.string
};

class ShoutboxPreview extends CommonPreview {
  render() {
    const { theme, color } = this.props;

    return (
      <ShoutBox>
        <Widget>
          <WidgetPreview className="engage-message type-default">
            {this.renderContent()}
          </WidgetPreview>
          <LogoContainer style={{ backgroundColor: theme ? theme : color }}>
            <LogoSpan>1</LogoSpan>
          </LogoContainer>
        </Widget>
      </ShoutBox>
    );
  }
}

ShoutboxPreview.propTypes = propTypes;

export default ShoutboxPreview;
