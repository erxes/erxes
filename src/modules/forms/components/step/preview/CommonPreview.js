import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import { FormPreview } from './';
import { PopupTitle, PreviewBody, BodyContent, PreviewWrapper } from '../style';

const propTypes = {
  calloutTitle: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  thankContent: PropTypes.string,
  carousel: PropTypes.string,
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onSort: PropTypes.func,
  onChange: PropTypes.func
};

class CommonPreview extends Component {
  renderContent() {
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
      carousel,
      thankContent,
      onChange
    } = this.props;

    const success = !(carousel === 'success');
    const form = !(carousel === 'form');
    const callout = !(carousel === 'callout');

    return (
      <PreviewWrapper>
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
                  ignoreTrans
                  btnStyle="primary"
                  style={{ backgroundColor: theme ? theme : color }}
                >
                  {btnText}
                </Button>
              )}
          </BodyContent>
        </PreviewBody>
      </PreviewWrapper>
    );
  }
}

CommonPreview.propTypes = propTypes;

export default CommonPreview;
