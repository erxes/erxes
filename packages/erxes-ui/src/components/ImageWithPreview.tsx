import { fadeIn, slideDown } from "../utils/animations";
import React from "react";
import styled from "styled-components";
import { readFile } from "../utils/core";
import CommonPortal from "./CommonPortal";

export const PreviewWrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  padding: 40px;
  background: rgba(48, 67, 92, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  z-index: 50000;
  animation-name: ${fadeIn};
  animation-duration: 0.3s;
  animation-timing-function: ease;
  cursor: zoom-out;

  img {
    width: auto;
    max-width: 80%;
    max-height: 80%;
    max-height: 80vh;
    box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
    transition: max-width 0.1s ease, max-height 0.1s ease;
    animation-name: ${slideDown};
    animation-duration: 0.3s;
    animation-timing-function: ease;
  }

  iframe {
    border-raidus: 3px;
    background-color: #fff;
    padding: 10px;
    max-width: 90%;
    height: 80%;
    margin-bottom: 50px;
  }
`;

export const Image = styled.img`
  cursor: zoom-in;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const KEYCODES = {
  ESCAPE: 27,
};

type Props = {
  alt?: string;
  src?: string;
  onLoad?: () => void;
  full?: boolean;
};

type State = {
  visible: boolean;
};

class ImageWithPreview extends React.Component<Props, State> {
  state = { visible: false };

  toggleImage = () => {
    this.setState({ visible: !this.state.visible });
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  handleKeydown = (e) => {
    if (e.keyCode === KEYCODES.ESCAPE && this.state.visible) {
      this.setState({ visible: false });
    }
  };

  render() {
    const { alt, src, onLoad } = this.props;

    return (
      <>
        <Image
          {...this.props}
          src={readFile(src || "")}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />
        {this.state.visible && (
          <CommonPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img alt={alt} src={readFile(src || "")} />
            </PreviewWrapper>
          </CommonPortal>
        )}
      </>
    );
  }
}

export default ImageWithPreview;
