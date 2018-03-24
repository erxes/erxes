import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { keyframes } from 'styled-components';
import { Button } from 'modules/common/components';
import { MessengerPreview, Messenger } from 'modules/engage/styles';
import { FormPreview } from './';
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
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: auto;
  margin-left: 0;
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
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onSort: PropTypes.func
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
      preview
    } = this.props;

    return (
      <ShoutBox data={preview}>
        <Widget>
          <WidgetPreviewStyled className="engage-message type-default">
            <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
              {calloutTitle}
            </PopupTitle>
            <PreviewBody>
              {image && (
                <div>
                  <img src={image} alt="eee" />
                </div>
              )}
              <BodyContent>
                {bodyValue}
                {fields && (
                  <FormPreview
                    fields={fields}
                    onFieldEdit={onFieldEdit}
                    onSort={onSort}
                  />
                )}
                {thankContent && thankContent}
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
