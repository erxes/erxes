import { fadeIn, slideDown } from 'modules/common/utils/animations';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
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

const KEYCODES = {
  ESCAPE: 27
};

type Props = {
  src?: string;
  alt?: string;
  onLoad?: () => void;
  full?: boolean;
  index?: number;
  switchItem?: (index: number) => string;
  imagesLength: number;
};

type State = {
  visible: boolean;
  src: string;
  alt?: string;
  num: number;
};

class ImageWithPreview extends React.Component<Props, State> {
  state = {
    visible: false,
    src: this.props.src || 'a',
    alt: this.props.src || 'a',
    num: this.props.index || 0
  };

  toggleImage = () => {
    this.setState({ visible: !this.state.visible });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = e => {
    if (e.keyCode === KEYCODES.ESCAPE && this.state.visible) {
      this.setState({ visible: false, src: this.props.src || '' });
    }
    if ((e.keyCode === 37 || e.keyCode === 39) && this.state.visible) {
      if (e.keyCode === 39) {
        if (this.props.switchItem) {
          if (this.props.imagesLength > this.state.num + 1) {
            this.setState({ num: this.state.num + 1 });
            const switchedUrl = this.props.switchItem(this.state.num) || '';
            this.setState({
              src: switchedUrl,
              alt: switchedUrl
            });
          } else {
            this.setState({ num: 0 });
            const switchedUrl = this.props.switchItem(0);

            this.setState({
              src: switchedUrl,
              alt: switchedUrl
            });
          }
        }
      }
      if (e.keyCode === 37) {
        if (this.props.switchItem) {
          if (0 <= this.state.num - 1) {
            this.setState({ num: this.state.num - 1 });
            const switchedUrl = this.props.switchItem(this.state.num);

            this.setState({
              src: switchedUrl,
              alt: switchedUrl
            });
          } else {
            this.setState({ num: this.props.imagesLength - 1 });
            const switchedUrl = this.props.switchItem(
              this.props.imagesLength - 1
            );

            this.setState({
              src: switchedUrl,
              alt: switchedUrl
            });
          }
        }
      }
    }
  };

  render() {
    const { onLoad, alt } = this.props;
    const { src } = this.state;
    console.log(this.props);

    return (
      <>
        <Image
          {...this.props}
          src={readFile(this.props.src || '')}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />
        {this.state.visible && (
          <PreviewPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img alt={alt} src={readFile(src || '')} />
            </PreviewWrapper>
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
