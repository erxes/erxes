import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { uploadHandler } from 'modules/common/utils';

const Attachment = styled.div`
  margin: 10px 0;

  img {
    display: inline-block;
    width: 35px;
    height: 35px;
    margin: 0 5px 5px 0;
  }
`;

const propTypes = {
  defaultFileList: PropTypes.array,
  onChange: PropTypes.func
};

class Uploader extends Component {
  constructor(props) {
    super(props);

    const { defaultFileList } = this.props;

    this.state = {
      attachments: defaultFileList || [],
      attachmentPreviewStyle: {}
    };

    this.handleFileInput = this.handleFileInput.bind(this);
  }

  handleFileInput(e) {
    const files = e.target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        this.setState({
          attachmentPreviewStyle: { opacity: '0.2' }
        });
      },

      afterUpload: ({ response, fileInfo }) => {
        // set attachments
        const attachments = [
          ...this.state.attachments,
          { url: response, ...fileInfo }
        ];

        this.props.onChange(attachments);

        this.setState({
          attachments,
          attachmentPreviewStyle: { opacity: '1' }
        });
      }
    });
  }

  removeAttachment(e) {
    const attachments = [...this.state.attachments];

    const index = attachments.indexOf(e);

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  }

  render() {
    const { attachments, attachmentPreviewStyle } = this.state;

    return (
      <Attachment>
        {attachments.map((e, index) => (
          <img
            key={index}
            alt="attachment"
            src="/images/attach.svg"
            style={attachmentPreviewStyle}
            onClick={e => this.removeAttachment(e)}
          />
        ))}
        <input type="file" multiple onChange={this.handleFileInput} />
      </Attachment>
    );
  }
}

Uploader.propTypes = propTypes;

export default Uploader;
