import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import {
  Embedded,
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

class EmbeddedPreview extends Component {
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
      <Embedded>
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
      </Embedded>
    );
  }
}

EmbeddedPreview.propTypes = propTypes;

export default EmbeddedPreview;
