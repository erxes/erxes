import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import { FormPreview } from './';
import {
  CenterContainer,
  FormContainer,
  PopupTitle,
  PreviewBody,
  BodyContent,
  OverlayTrigger
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

class PopupPreview extends Component {
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
      thankContent,
      preview
    } = this.props;

    return (
      <CenterContainer data={preview}>
        <OverlayTrigger />
        <FormContainer>
          <PopupTitle style={{ backgroundColor: theme ? theme : color }}>
            {title}
          </PopupTitle>
          <PreviewBody>
            {image && (
              <div>
                {' '}
                <img src={image} alt="eee" />{' '}
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
        </FormContainer>
      </CenterContainer>
    );
  }
}

PopupPreview.propTypes = propTypes;
PopupPreview.defaultProps = {
  fields: []
};
export default PopupPreview;
