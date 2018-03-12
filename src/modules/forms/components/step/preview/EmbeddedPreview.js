import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import { Embedded, PopupTitle, PreviewBody, BodyContent } from '../style';

const propTypes = {
  title: PropTypes.string,
  bodyValue: PropTypes.string,
  btnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string
};

class EmbeddedPreview extends Component {
  render() {
    const { theme, color, title, bodyValue, btnText, image } = this.props;

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
