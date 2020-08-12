import React from "react";
import { __, Alert, uploadHandler, readFile } from "modules/common/utils";
import { IAttachment } from "../types";
import Icon from "modules/common/components/Icon";
import Spinner from "./Spinner";
import PreviewWithBig from "./PreviewWithBig";

import {
  AttachmentWrapper,
  UploadBtn,
  LoadingContainer,
  PreviewWrapper,
  ToggleButton,
  Delete,
  Item,
  List,
  AttachmentName,
  Download,
  ItemInfo,
  Meta,
  BiggerPreviewWrapper,
} from "../styles/attachmentcss";

type Props = {
  defaultFileList?: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  single?: boolean;
  multiple?: boolean;
  limit?: number;
  scrollBottom?: () => void;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
  hideOthers: boolean;
  visible: boolean;
  currentIndex: number;
};

class AttachmentPreview extends React.Component<Props, State> {
  static defaultProps = {
    multiple: true,
    limit: 4,
  };
  constructor(props: Props) {
    super(props);

    this.state = {
      attachments: props.defaultFileList || [],
      loading: false,
      hideOthers: true,
      visible: false,
      currentIndex: 0,
    };
  }

  toggleAttachments = () => {
    this.setState({ hideOthers: !this.state.hideOthers });
  };

  toggleFile = () => {
    this.setState({ visible: !this.state.visible });
  };

  handleClose = () => {
    this.setState({
      visible: false,
    });
  };

  handleOpen = (index, item) => {
    this.setState({
      visible: true,
      currentIndex: index,
    });
    console.log(item);
  };

  renderToggleButton = (hiddenCount: number) => {
    if (hiddenCount > 0) {
      const buttonText = this.state.hideOthers
        ? `${__("View all attachments")} (${hiddenCount} ${__("hidden")})`
        : `${__("Show fewer attachments")}`;

      return (
        <ToggleButton onClick={this.toggleAttachments}>
          {buttonText}
        </ToggleButton>
      );
    }

    return null;
  };

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

  renderUploadButton() {
    const { multiple, single } = this.props;

    if (single && this.state.attachments.length > 0) {
      return null;
    }

    return (
      <UploadBtn>
        <label>
          {__("Upload an attachment")}
          <input
            type="file"
            multiple={multiple}
            onChange={this.handleFileInput}
          />
        </label>
      </UploadBtn>
    );
  }

  removeAttachment = (index: number) => {
    const attachments = [...this.state.attachments];

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  renderOtherInfo = (attachment) => {
    const name = attachment.name || attachment.url || "";

    return (
      <>
        <h5>
          <AttachmentName>{name}</AttachmentName>
          <Download
            rel="noopener noreferrer"
            href={readFile(attachment.url)}
            target="_blank"
          >
            <Icon icon="external-link-alt" />
          </Download>
        </h5>
        <Meta>
          {attachment.size && (
            <span>Size: {Math.round(attachment.size / 1000)}kB</span>
          )}
        </Meta>
      </>
    );
  };

  renderAttachments(item, index) {
    return (
      <Item key={item.url} onClick={() => this.handleOpen(index, item)}>
        <AttachmentWrapper>
          <PreviewWrapper>
            <img
              style={{ borderRadius: "5px" }}
              alt={this.state.attachments[index].url}
              src={this.state.attachments[index].url}
            />
          </PreviewWrapper>
          <ItemInfo>{this.renderOtherInfo(item)}</ItemInfo>
        </AttachmentWrapper>
        <Delete onClick={() => this.removeAttachment(index)}>
          <Icon icon="trash-alt" />
        </Delete>
      </Item>
    );
  }

  onLoadImage = () => {
    const { scrollBottom } = this.props;

    if (scrollBottom) {
      scrollBottom();
    }
  };

  handleNext = (currentIndex) => {
    let nextIndex = currentIndex + 1;
    if (nextIndex > this.state.attachments.length - 1) {
      this.setState({ currentIndex: 0 });
    } else {
      this.setState({ currentIndex: currentIndex + 1 });
    }
  };

  handlePrevious = (currentIndex) => {
    if (currentIndex > 0)
      this.setState({
        currentIndex: currentIndex - 1,
      });
    else
      this.setState({
        currentIndex: this.state.attachments.length - 1,
      });
  };

  // renderFiles = () => {
  //   this.state.attachments.map((attachment) => {
  //     if(attachment.type.startsWith('image')){
  //       <img style={{ width: 100 }} src={attachment.url}/> 
  //     } else {
  //       <Icon style={{ width: 100 }} icon={'trash-alt'}/> 
  //     }
  //   }
       
  //   );
  // };

  render() {
    const { loading, hideOthers, attachments } = this.state;
    const { limit = 4 } = this.props;
    const length = attachments.length;

    return (
      <>
        {loading && (
          <LoadingContainer>
            <Spinner objective={true} size={18} />
            {"Uploading"}...
          </LoadingContainer>
        )}
        <List>
          {this.state.attachments
            .slice(0, limit && hideOthers ? limit : length)
            .map((item, index) => this.renderAttachments(item, index))}
        </List>
        {this.renderToggleButton(length - limit)}
        {this.renderUploadButton()}

        <PreviewWithBig
          show={this.state.visible}
          handleClose={() => this.handleClose()}
        >
          <BiggerPreviewWrapper>
            <button
              onClick={() => this.handlePrevious(this.state.currentIndex)}
            >
              next
            </button>
            {/* {this.renderFiles()} */}
            
            <img
              style={{ width: 100 }}
              src={this.state.attachments[this.state.currentIndex].url}
            />
            <button onClick={() => this.handleNext(this.state.currentIndex)}>
              next
            </button>
            <button onClick={() => this.handleClose()}>close</button>
          </BiggerPreviewWrapper>
        </PreviewWithBig>
      </>
    );
  }
}

export default AttachmentPreview;
