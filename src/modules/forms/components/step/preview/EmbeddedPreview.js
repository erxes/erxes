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

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

class EmbeddedPreview extends Component {
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
      preview,
      carousel,
      thankContent,
      onChange
    } = this.props;

    const success = !(carousel === 'success');
    const form = !(carousel === 'form');
    const callout = !(carousel === 'callout');

    return (
      <Container data={preview}>
        <Embedded>
          <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
            {success && calloutTitle}
          </PopupTitle>
          <PreviewBody embedded="embedded">
            {image &&
              success && (
                <div>
                  <img src={image} alt="eee" />
                </div>
              )}
            <BodyContent>
              {success && bodyValue}
              {fields &&
                callout &&
                success && (
                  <FormPreview
                    fields={fields}
                    onFieldEdit={onFieldEdit}
                    onSort={onSort}
                    onChange={onChange}
                  />
                )}
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
        </Embedded>
      </Container>
    );
  }
}

EmbeddedPreview.propTypes = propTypes;

export default EmbeddedPreview;
