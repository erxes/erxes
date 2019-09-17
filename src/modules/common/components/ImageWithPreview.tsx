import { fadeIn, slideDown } from 'modules/common/utils/animations';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { IAttachment } from '../types';
import { readFile } from '../utils';

const PreviewWrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
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
`;

const Image = styled.img`
  cursor: zoom-in;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const PreviousButton = styled.button`
  position: absolute;
  left: 0;
  top: 50%;
  padding: 20px;
  cursor: pointer;
`;

const NextButton = styled(PreviousButton)`
  right: 0;
  left: auto;
`;

const KEYCODES = {
  ESCAPE: 27,
  LEFT: 37,
  RIGHT: 39
};

type Props = {
  src?: string;
  alt?: string;
  onLoad?: () => void;
  full?: boolean;
  attachments: IAttachment[];
};

type State = {
  visible: boolean;
  attachments: any[];
  attachment: any;
};

class ImageWithPreview extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      attachments: props.attachments,
      attachment: props.attachments[0]
    };
  }

  // tslint:disable
  toggleImage = () => {
    this.setState({ visible: !this.state.visible });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);

    this.state.attachments.map((attachment, index) =>
      Object.assign(attachment, { index })
    );
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  previous() {
    let newIndex = this.state.attachment.index - 1;

    if (this.state.attachment.index === 0) {
      newIndex = 0;
    }

    this.setState({
      attachment: this.state.attachments[newIndex]
    });
  }

  next() {
    let newIndex = this.state.attachment.index + 1;

    if (this.state.attachment.index === this.state.attachments.length - 1) {
      newIndex = 0;
    }

    this.setState({
      attachment: this.state.attachments[newIndex]
    });
  }

  handleKeydown = e => {
    if (e.keyCode === KEYCODES.ESCAPE && this.state.visible) {
      this.setState({ visible: false });
    }

    if (e.keyCode === KEYCODES.LEFT) {
      this.previous();
    }
    if (e.keyCode === KEYCODES.RIGHT) {
      this.next();
    }
  };

  render() {
    const { src, alt, onLoad } = this.props;
    const { attachment } = this.state;

    return (
      <>
        <Image
          {...this.props}
          src={readFile(src || '')}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />
        {this.state.visible && (
          <PreviewPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img alt={alt} src={readFile(attachment.url || '')} />
            </PreviewWrapper>

            <PreviousButton className="preview" onClick={this.previous}>
              aa
            </PreviousButton>
            <NextButton className="next" onClick={this.next}>
              bb
            </NextButton>
          </PreviewPortal>
        )}
      </>
    );
  }
}

class PreviewPortal extends React.Component<{ children: React.ReactNode }> {
  private el;

  constructor(props) {
    super(props);

    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

export default ImageWithPreview;
