import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Spinner } from 'modules/common/components';
import { colors } from 'modules/common/styles';

const Preview = styled.div`
  max-width: 360px;
  padding: 20px;
  background: ${colors.colorSecondary};
  margin: 5px 55px 0 auto;
  display: inline-block;
  float: right;
  box-shadow: 0 1px 5px 0 ${colors.darkShadow};
  border-radius: 20px;
  position: relative;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -12px;
    margin-top: -12px;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
`;

const File = styled.span`
  width: 80px;
  height: 50px;
  display: block;
`;

const propTypes = {
  attachmentPreview: PropTypes.object,
  scrollBottom: PropTypes.func
};

class AttachmentPreview extends Component {
  constructor(props) {
    super(props);

    this.onLoadImage = this.onLoadImage.bind(this);
  }

  onLoadImage() {
    this.props.scrollBottom();
  }

  render() {
    const { attachmentPreview } = this.props;

    if (attachmentPreview && attachmentPreview.data) {
      return (
        <Preview>
          {attachmentPreview.type.startsWith('image') ? (
            <img
              onLoad={this.onLoadImage}
              alt={attachmentPreview.name}
              src={attachmentPreview.data}
            />
          ) : (
            <File />
          )}
          <Spinner />
        </Preview>
      );
    }
    return null;
  }
}

AttachmentPreview.propTypes = propTypes;

export default AttachmentPreview;
