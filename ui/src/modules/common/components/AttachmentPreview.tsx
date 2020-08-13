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
    Next,
    Previous,
    Close
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

const KEYCODES = {
  ESCAPE: 27,
  left : 37,
  up : 38,
  right : 39,
  down : 40
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



  componentDidMount() {
    document.addEventListener('keydown', this.handleNextPreviousDown );
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleNextPreviousDown );
  }


  handleNextPreviousDown = e => {
    if(e.keyCode === KEYCODES.right){
      this.handleNext(this.state.currentIndex)
    } else if(e.keyCode === KEYCODES.left) {
      this.handlePrevious(this.state.currentIndex)
    } else if(e.keyCode === KEYCODES.ESCAPE){
      this.handleClose()
    }
  }

  toggleAttachments = () => {
    this.setState({ hideOthers: !this.state.hideOthers });
  };

  toggleFile = () => {
    this.setState({ visible: !this.state.visible });
  };

  handleClose = () => {
    this.setState({
      visible: false
    });
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
      <Item key={item.url} onClick={this.handleOpen.bind(this,item,index)}>
        <AttachmentWrapper>
          <PreviewWrapper>
            {this.renderFiles(item)}
          </PreviewWrapper>
          <ItemInfo>{this.renderOtherInfo(item)}</ItemInfo>
        </AttachmentWrapper>
        <Delete onClick={this.removeAttachment.bind(this,index)}>
          <Icon icon="trash-alt" />
        </Delete>
      </Item>
    );
  }

  handleNext = (currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex > this.state.attachments.length - 1) {
      this.setState({ currentIndex: 0 });
    } else {
      this.setState({ currentIndex: currentIndex + 1 });
    }
  };

  handlePrevious = (currentIndex) => {
    if (currentIndex > 0) {
      this.setState({
        currentIndex: currentIndex - 1,
      });
    }
    else {
      this.setState({
        currentIndex: this.state.attachments.length - 1,
      });
    }
  };

  handleOpen = (item: IAttachment, index) => {
    this.setState({
      visible: true,
      currentIndex: index,
    });
  };

  renderFiles = (item: IAttachment) => {
    if (item.type.startsWith('image')) {
      return <img key={item.url}  src={item.url} alt={item.url}/>
    }
      return <Icon key={item.url} style={{width: 100, marginLeft:40}} icon='trash-alt'/>;

  };

  checkingMimeType = (url: string) => {
    if(url === null){
      return null
    }

    const fileExtension = url.split('.').pop() || '';
    const embeddedURL = `https://docs.google.com/viewer?url=${url}&embedded=true`

    if(fileExtension.startsWith('docx')){
      return  <iframe key={url}  src={embeddedURL} style={{width: '800px', height:'900px'}} />
    } else if(fileExtension.startsWith('pdf')){
      return  <iframe key={url}  src={embeddedURL} style={{width: '800px', height:'900px'}} />
    }
    return <img src={url} alt={url} />

  }

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
          handleClose={this.handleClose}
        >
          <BiggerPreviewWrapper>
            <Previous onClick={this.handlePrevious.bind(this, this.state.currentIndex)}>
              <Icon icon={'arrow-left'}/>
            </Previous>

            {this.state.attachments[this.state.currentIndex].url ? this.checkingMimeType(this.state.attachments[this.state.currentIndex].url) : null}
            {/*<img*/}
            {/*  src={this.state.attachments[this.state.currentIndex].url} alt={this.state.attachments[this.state.currentIndex].url}*/}
            {/*/>*/}
            <Next onClick={this.handleNext.bind(this, this.state.currentIndex)}>
              <Icon icon={'arrow-right'}/>
            </Next>
            <Close onClick={this.handleClose}>
              <Icon icon={'cancel'}/>
            </Close>
          </BiggerPreviewWrapper>
        </PreviewWithBig>
      </>
    );
  }
}

export default AttachmentPreview;
