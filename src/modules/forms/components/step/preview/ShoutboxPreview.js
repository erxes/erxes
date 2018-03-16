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
import {
  PopupTitle,
  PreviewBody,
  BodyContent,
  FormBody,
  FieldTitle
} from '../style';

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
  background: url('/images/preview.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
  title: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  thankContent: PropTypes.string,
  options: PropTypes.array
};

class ShoutboxPreview extends Component {
  renderField(field, index) {
    return (
      <FormBody key={index}>
        <FieldTitle>{field}:</FieldTitle>
        <input />
      </FormBody>
    );
  }

  render() {
    const {
      theme,
      color,
      title,
      bodyValue,
      btnText,
      image,
      options,
      thankContent
    } = this.props;

    return (
      <ShoutBox>
        <Widget>
          <WidgetPreviewStyled className="engage-message type-default">
            <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
              {title}
            </PopupTitle>
            <PreviewBody>
              {image && (
                <div>
                  <img src={image} alt="eee" />
                </div>
              )}
              <BodyContent>
                {bodyValue}
                {thankContent && thankContent}
                {options &&
                  this.props.options.map((field, index) =>
                    this.renderField(field, index)
                  )}
                {btnText && (
                  <Button
                    btnStyle="primary"
                    style={{ backgroundColor: theme ? theme : color }}
                  >
                    {btnText}
                  </Button>
                )}
              </BodyContent>
            </PreviewBody>
          </WidgetPreviewStyled>
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
