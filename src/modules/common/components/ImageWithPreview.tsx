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

  .rightArrow {
    position: fixed;
    right: 0%;
    background: rgba(48, 50, 80);

    &:hover {
      background: #141a47;
    }
  }

  .leftArrow {
    position: fixed;
    left: 0%;
    background: rgba(50, 50, 80);

    &:hover {
      background: #141a47;
    }
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
  imagesLength?: any;
};

type State = {
  visible: boolean;
  srcUrl: string;
  num: number;
  preImageUrl: number;
};

class ImageWithPreview extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { src, index } = props;

    this.state = {
      visible: false,
      srcUrl: src || 'a',
      num: index || 0,
      preImageUrl: index || 0
    };
  }

  toggleImage = () => {
    this.setState({ visible: !this.state.visible });
    if (this.props.switchItem) {
      const prevItem = this.props.switchItem(this.state.preImageUrl);
      const prevNum = this.props.index;
      this.setState({ srcUrl: prevItem, num: prevNum || 0 });
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  rightClick = e => {
    e.stopPropagation();

    const { switchItem, imagesLength } = this.props;
    const { visible } = this.state;

    let switchedUrl;

    if (visible) {
      if (switchItem) {
        if (imagesLength > this.state.num + 1) {
          this.setState({ num: this.state.num + 1 });

          switchedUrl = switchItem(this.state.num) || '';
        } else {
          this.setState({ num: 0 });

          switchedUrl = switchItem(0);
        }
        this.setState({
          srcUrl: switchedUrl
        });
      }
    }
  };

  leftClick = e => {
    e.stopPropagation();

    const { switchItem, imagesLength } = this.props;
    const { visible } = this.state;

    let switchedUrl;

    if (visible) {
      if (switchItem) {
        if (0 <= this.state.num - 1) {
          this.setState({ num: this.state.num - 1 });

          switchedUrl = switchItem(this.state.num);
        } else {
          this.setState({ num: imagesLength - 1 });

          switchedUrl = switchItem(imagesLength - 1);
        }
        this.setState({
          srcUrl: switchedUrl
        });
      }
    }
  };

  handleKeydown = e => {
    const { src } = this.props;
    const { visible } = this.state;

    if (e.keyCode === KEYCODES.ESCAPE && visible) {
      this.setState({ visible: false, srcUrl: src || '' });
    }
    if ((e.keyCode === 37 || e.keyCode === 39) && visible) {
      if (e.keyCode === 39) {
        this.rightClick(e);
      }
      if (e.keyCode === 37) {
        this.leftClick(e);
      }
    }
  };

  renderBtn = () => {
    if (this.props.imagesLength > 1) {
      return (
        <>
          <button onClick={this.rightClick} className="rightArrow">
            &#8594;
          </button>
          <button onClick={this.leftClick} className="leftArrow">
            &#8592;
          </button>
        </>
      );
    } else {
      return null;
    }
  };

  render() {
    const { onLoad, alt } = this.props;
    const { srcUrl } = this.state;

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
              <img
                alt={alt}
                onClick={this.toggleImage}
                src={readFile(srcUrl || '')}
              />
              {this.renderBtn()}
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
