import React from "react";
import styled from "styled-components";
import { readFile, __ } from "../utils/core";
import CommonPortal from "./CommonPortal";
import Icon from "./Icon";
import { IAttachment } from "../types";
import { PreviewWrapper, Image } from "./ImageWithPreview";

const PreviewOverlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  right: 0;
  left: 0;
  height: 100px;
  bottom: 0;
  z-index: 50000;
  cursor: default;
  text-align: center;

  > div {
    color: #fff;
    padding: 12px 10%;

    h4 {
      margin: 0 0 8px;
    }

    p {
      margin-bottom: 5px;
      font-size: 14px;
      opacity: 0.8;
    }
  }
`;

const PreviewBtn = styled.a`
  position: fixed;
  height: 100px;
  bottom: 0;
  z-index: 60000;
  width: 10%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > i {
    color: #fff;
    opacity: 0.6;
    padding: 36px;
    transition: all ease 0.3s;
  }

  &:hover {
    > i {
      opacity: 1;
      transform: translateX(-5%) scale(1.1);
    }
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14px;

  > a {
    text-decoration: underline;
    color: #fff;
    margin-right: 20px;
    opacity: 0.8;
    transition: all ease 0.3s;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    > i {
      margin-right: 5px;
    }
  }
`;

const CloseAttachment = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 20px 30px;
  color: #fff;
  cursor: pointer;
  transition: all ease 0.3;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

const KEYCODES = {
  ESCAPE: 27,
  ARROWRIGHT: 39,
  ARROWLEFT: 37,
};

type Props = {
  index?: number;
  onLoad?: () => void;
  full?: boolean;
  icon?: string;
  attachments?: IAttachment[];
  attachment: IAttachment;
};

type State = {
  visible: boolean;
  currentIndex: number;
};

class AttachmentWithPreview extends React.Component<Props, State> {
  state = { visible: false, currentIndex: 0 };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  handleKeydown = (e) => {
    const { currentIndex, visible } = this.state;
    const activeIndex =
      currentIndex !== 0 ? currentIndex : this.props.index || 0;

    if (e.keyCode === KEYCODES.ESCAPE && visible) {
      this.setState({ visible: false });
    }

    if (e.keyCode === KEYCODES.ARROWRIGHT && visible) {
      this.onSlide("right", activeIndex);
    }

    if (e.keyCode === KEYCODES.ARROWLEFT && visible) {
      this.onSlide("left", activeIndex);
    }
  };

  onToggle = () => {
    this.setState({ visible: !this.state.visible, currentIndex: 0 });
  };

  onSlide = (type: string, index: number) => {
    const { attachments } = this.props;

    if (!attachments || attachments.length === 0) {
      return null;
    }

    const condition =
      type === "left" ? index - 1 === -1 : index + 1 === attachments.length;
    const conditionValue = type === "left" ? attachments.length - 1 : 0;
    const indexValue = type === "left" ? index - 1 : index + 1;

    if (condition) {
      return this.setState({ currentIndex: conditionValue });
    }

    return this.setState({ currentIndex: indexValue });
  };

  renderDocViewer = (url) => {
    return (
      <iframe
        src={
          "https://docs.google.com/viewer?url=" +
          readFile(url || "") +
          "&embedded=true"
        }
        width="100%"
      ></iframe>
    );
  };

  renderModalPreview() {
    const { attachments, attachment, index } = this.props;
    const { currentIndex } = this.state;

    if (attachments && attachments.length !== 0) {
      const galleryAttachment =
        attachments[currentIndex !== 0 ? currentIndex : index || 0];

      if (galleryAttachment.type.startsWith("image")) {
        return (
          <img
            alt={galleryAttachment.name}
            src={readFile(galleryAttachment.url || "")}
          />
        );
      }

      return this.renderDocViewer(galleryAttachment.url);
    }

    return this.renderDocViewer(attachment.url);
  }

  renderModalContent() {
    const { index, attachments } = this.props;
    const { currentIndex } = this.state;

    if (!attachments || attachments.length === 0) {
      return null;
    }

    const galleryAttachment =
      attachments[currentIndex !== 0 ? currentIndex : index || 0];

    return (
      <>
        <PreviewOverlay>
          <div>
            <h4>{galleryAttachment.name}</h4>
            <p>
              {__("Size")} -{" "}
              {galleryAttachment.size &&
                Math.round(galleryAttachment.size / 1000)}
              kB
            </p>
            <Actions>
              <a
                href={`https://docs.google.com/viewerng/viewer?url=${readFile(
                  galleryAttachment.url || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon="external-link-alt" size={12} />{" "}
                {__("Open in new tab")}
              </a>
              <a
                href={readFile(galleryAttachment.url || "")}
                rel="noopener noreferrer"
              >
                <Icon icon="download-1" size={12} /> {__("Download")}
              </a>
            </Actions>
          </div>
        </PreviewOverlay>
        <PreviewBtn
          className="left"
          onClick={() =>
            this.onSlide("left", currentIndex !== 0 ? currentIndex : index || 0)
          }
        >
          <Icon icon="angle-left" size={32} />
        </PreviewBtn>
        <PreviewBtn
          className="right"
          onClick={() =>
            this.onSlide(
              "right",
              currentIndex !== 0 ? currentIndex : index || 0
            )
          }
        >
          <Icon icon="angle-right" size={32} />
        </PreviewBtn>
      </>
    );
  }

  renderModal() {
    const { visible } = this.state;

    if (!visible) {
      return null;
    }

    return (
      <CommonPortal>
        <PreviewWrapper onClick={this.onToggle}>
          <CloseAttachment>
            <Icon icon="cancel" size={20} onClick={this.onToggle} />
          </CloseAttachment>

          {this.renderModalPreview()}
        </PreviewWrapper>
        {this.renderModalContent()}
      </CommonPortal>
    );
  }

  renderAttachmentPreview() {
    const { onLoad, attachment, icon } = this.props;

    if (icon) {
      return <Icon icon={icon} onClick={this.onToggle} />;
    }

    return (
      <Image
        src={readFile(attachment.url || "")}
        onLoad={onLoad}
        onClick={this.onToggle}
      />
    );
  }

  render() {
    return (
      <>
        {this.renderAttachmentPreview()}
        {this.renderModal()}
      </>
    );
  }
}

export default AttachmentWithPreview;
