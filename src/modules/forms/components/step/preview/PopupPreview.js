import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import {
  CenterContainer,
  FormContainer,
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
  thankContent: PropTypes.string,
  options: PropTypes.array
};

class PopupPreview extends Component {
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
      <CenterContainer>
        <FormContainer>
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
                <Button btnStyle="primary" style={{ backgroundColor: color }}>
                  {btnText}
                </Button>
              )}
            </BodyContent>
          </PreviewBody>
        </FormContainer>
      </CenterContainer>
    );
  }
}

PopupPreview.propTypes = propTypes;

export default PopupPreview;
