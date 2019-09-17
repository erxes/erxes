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
  attachments?: IAttachment[];
  attachment?: IAttachment;
};

type State = {
  visible: boolean;
  attachments?: IAttachment[];
  attachment: any;
};

class ImageWithPreview extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      attachments: props.attachments,
      attachment: props.attachment
    };
  }

  // tslint:disable
  toggleImage = () => {
    this.setState({
      visible: !this.state.visible,
      attachment: this.props.attachment
    });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);

    (this.state.attachments || []).map((attachment, index) =>
      Object.assign(attachment, { index })
    );
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  previous() {
    const { attachment, attachments } = this.state;
    let newIndex = attachment.index - 1;

    if (attachment.index === 0) {
      newIndex = (attachments || []).length - 1;
    }

    this.setState({
      attachment: (attachments || [])[newIndex]
    });
  }

  next() {
    const { attachment, attachments } = this.state;
    let newIndex = attachment.index + 1;

    if (attachment.index === (attachments || []).length - 1) {
      newIndex = 0;
    }

    this.setState({
      attachment: (attachments || [])[newIndex]
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
    const { attachment, src, alt, onLoad } = this.props;

    return (
      <>
        <Image
          {...this.props}
          src={readFile(attachment ? attachment.url : src || '')}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />
        {this.state.visible && (
          <PreviewPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img
                alt={attachment ? attachment.url : alt}
                src={readFile(
                  attachment ? this.state.attachment.url : src || ''
                )}
              />
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
