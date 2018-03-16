import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import {
  Embedded,
  PopupTitle,
  PreviewBody,
  BodyContent,
  FormBody,
  FieldTitle,
  CenterContainer
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

const EmbeddedPreviewBody = PreviewBody.extend`
  background-color: #fff;
`;

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

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
      options,
      thankContent
    } = this.props;

    return (
      <Container>
        <Embedded>
          <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
            {title}
          </PopupTitle>
          <EmbeddedPreviewBody>
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
          </EmbeddedPreviewBody>
        </Embedded>
      </Container>
    );
  }
}

EmbeddedPreview.propTypes = propTypes;

export default EmbeddedPreview;
