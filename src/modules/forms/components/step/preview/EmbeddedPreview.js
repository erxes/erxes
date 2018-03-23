import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import { FormPreview } from './';
import {
  Embedded,
  PopupTitle,
  PreviewBody,
  BodyContent,
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
  preview: PropTypes.string,
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onSort: PropTypes.func
};

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

class EmbeddedPreview extends Component {
  render() {
    const {
      theme,
      color,
      title,
      bodyValue,
      btnText,
      image,
      fields,
      onFieldEdit,
      onSort,
      preview,
      thankContent
    } = this.props;

    return (
      <Container data={preview}>
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
        </Embedded>
      </Container>
    );
  }
}

EmbeddedPreview.propTypes = propTypes;

export default EmbeddedPreview;
