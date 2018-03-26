import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { keyframes } from 'styled-components';
import { Button } from 'modules/common/components';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import {
  WidgetPreviewStyled,
  LogoContainer,
  LogoSpan
} from 'modules/settings/styles';
import { PopupTitle, PreviewBody, BodyContent } from '../style';

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
  calloutTitle: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  thankContent: PropTypes.string,
  preview: PropTypes.string,
  carousel: PropTypes.string,
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onSort: PropTypes.func,
  onChange: PropTypes.func
};

class ShoutboxPreview extends Component {
  render() {
    const {
      theme,
      color,
      calloutTitle,
      bodyValue,
      btnText,
      image,
      fields,
      onFieldEdit,
      onSort,
      thankContent,
      preview,
      carousel,
      onChange
    } = this.props;

    const success = !(carousel === 'success');
    const form = !(carousel === 'form');
    const callout = !(carousel === 'callout');

    return (
      <ShoutBox data={preview}>
        <Widget>
          <WidgetPreview className="engage-message type-default">
            <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
              {success && calloutTitle}
            </PopupTitle>
            <PreviewBody>
              {image &&
                success && (
                  <div>
                    <img src={image} alt="eee" />
                  </div>
                )}
              <BodyContent>
                {success && bodyValue}
                {thankContent && callout && form && thankContent}
                {btnText &&
                  success && (
                    <Button
                      btnStyle="primary"
                      style={{ backgroundColor: theme ? theme : color }}
                    >
                      {btnText}
                    </Button>
                  )}
              </BodyContent>
            </PreviewBody>
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
ShoutboxPreview.contextTypes = {
  __: PropTypes.func
};

export default ShoutboxPreview;
