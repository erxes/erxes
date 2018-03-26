import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import {
  CenterContainer,
  FormContainer,
  PopupTitle,
  PreviewBody,
  BodyContent,
  OverlayTrigger
} from '../style';

const propTypes = {
  calloutTitle: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  thankContent: PropTypes.string,
  carousel: PropTypes.string,
  preview: PropTypes.string,
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onSort: PropTypes.func,
  onChange: PropTypes.func
};

class PopupPreview extends Component {
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
      <CenterContainer data={preview}>
        <OverlayTrigger />
        <FormContainer>
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
