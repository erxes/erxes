import { Spinner } from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { IAttachment } from '../types';

const Attachment = styled.div`
  margin: 10px 0;

  img {
    display: inline-block;
    width: 35px;
    height: 35px;
    margin: 0 5px 5px 0;
  }
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
  attachmentPreviewStyle: any;
};

class Uploader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { defaultFileList } = this.props;

    this.state = {
      attachments: defaultFileList || [],
      loading: false,
      attachmentPreviewStyle: {}
    };
  }

  handleFileInput = e => {
    const files = e.target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        this.setState({
          loading: true,
          attachmentPreviewStyle: { opacity: '0.2' }
        });
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response);
          return this.setState({ loading: false });
        }

        Alert.info('Success');

        // set attachments
        const attachment = { url: response, ...fileInfo };

        const attachments = [...this.state.attachments, attachment];

        this.props.onChange(attachments);

        this.setState({
          loading: false,
          attachments,
          attachmentPreviewStyle: { opacity: '1' }
        });
      }
    });
  };

  removeAttachment = e => {
    const attachments = [...this.state.attachments];

    const index = attachments.indexOf(e);

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  render() {
    const { loading, attachments, attachmentPreviewStyle } = this.state;

    return (
      <Attachment>
        {attachments.map((event, index) => (
          <img
            key={index}
            alt="attachment"
            src="/images/attach.svg"
            style={attachmentPreviewStyle}
            onClick={this.removeAttachment}
          />
        ))}
        {loading && <Spinner />}
        <input type="file" multiple={true} onChange={this.handleFileInput} />
      </Attachment>
    );
  }
}

export default Uploader;
