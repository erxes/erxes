import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const propTypes = {
  title: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
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
      options
    } = this.props;

    return (
      <MessengerPreview>
        <Messenger>
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
                {options &&
                  this.props.options.map((field, index) =>
                    this.renderField(field, index)
                  )}
                <Button btnStyle="primary" style={{ backgroundColor: color }}>
                  {btnText}
                </Button>
              </BodyContent>
            </PreviewBody>
          </WidgetPreviewStyled>
          <LogoContainer style={{ backgroundColor: color }}>
            <LogoSpan>1</LogoSpan>
          </LogoContainer>
        </Messenger>
      </MessengerPreview>
    );
  }
}

ShoutboxPreview.propTypes = propTypes;
ShoutboxPreview.contextTypes = {
  __: PropTypes.func
};

export default ShoutboxPreview;
