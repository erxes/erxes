import Alert from "../utils/Alert";
import AttachmentsGallery from "./AttachmentGallery";
import { IAttachment } from "./types";
import React from "react";
import Spinner from "./Spinner";
import colors from "../styles/colors";
import { rgba } from "../styles/ecolor";
import styled from "styled-components";
import uploadHandler from "./uploadHandler";

const LoadingContainer = styled.div`
  margin: 10px 0;
  background: ${colors.bgActive};
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    height: 80px;
    margin-right: 7px;
  }
`;

const UploadBtn = styled.div`
  position: relative;
  margin-top: 10px;

  label {
    padding: 7px 15px;
    background: ${rgba(colors.colorCoreDarkBlue, 0.05)};
    border-radius: 4px;
    font-weight: 500;
    transition: background 0.3s ease;
    display: inline-block;

    &:hover {
      background: ${rgba(colors.colorCoreDarkBlue, 0.1)};
      cursor: pointer;
    }
  }

  input[type="file"] {
    display: none;
  }
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  limit?: number;
  multiple?: boolean;
  showUploader?: boolean;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
};

class Uploader extends React.Component<Props, State> {
  static defaultProps = {
    multiple: true,
    limit: 4,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      attachments: props.defaultFileList || [],
      loading: false,
    };
  }

  handleFileInput = ({ target }) => {
    const files = target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        this.setState({
          loading: true,
        });
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== "ok") {
          Alert.error(response);
          return this.setState({ loading: false });
        }

        Alert.info("Success");

        // set attachments
        const attachment = { url: response, ...fileInfo };

        const attachments = [attachment, ...this.state.attachments];

        this.props.onChange(attachments);

        this.setState({
          loading: false,
          attachments,
        });
      },
    });

    target.value = "";
  };

  removeAttachment = (index: number) => {
    const attachments = [...this.state.attachments];

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  renderUploadButton() {
    const { multiple, single, showUploader } = this.props;

    if (!showUploader || (single && this.state.attachments.length > 0)) {
      return null;
    }

    return (
      <UploadBtn>
        <label>
          Upload an attachment
          <input
            type="file"
            multiple={multiple}
            onChange={this.handleFileInput}
          />
        </label>
      </UploadBtn>
    );
  }

  render() {
    const { limit = 4, onChange, showUploader } = this.props;
    const { attachments, loading } = this.state;

    return (
      <>
        {loading && (
          <LoadingContainer>
            <Spinner objective={true} size={18} />
            Uploading...
          </LoadingContainer>
        )}
        {!showUploader && (
          <AttachmentsGallery
            attachments={attachments}
            limit={limit}
            onChange={onChange}
            removeAttachment={this.removeAttachment}
          />
        )}
        {this.renderUploadButton()}
      </>
    );
  }
}

export default Uploader;
