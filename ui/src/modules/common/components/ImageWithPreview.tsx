import { fadeIn, slideDown } from 'modules/common/utils/animations';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '../styles/colors';
import { readFile } from '../utils';
import Icon from './Icon';

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

const ButtonDirection = styledTS<{ arrow?: string }>(styled.button)`
    position: absolute;
    ${props => (props.arrow === 'right' ? `right: 20px` : `left: 20px`)}
    background: ${colors.colorLightGray};
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 20px;
    opacity: 0.8;

    > i {
      font-weight: 600;
      font-size: 18px;
    }

    &:hover {
      background: ${colors.colorCoreDarkGray};
      color: ${colors.colorWhite};
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
    const { switchItem, index } = this.props;
    const { preImageUrl } = this.state;

    if (switchItem) {
      const prevItem = switchItem(preImageUrl);
      const prevNum = index;

      return this.setState({
        visible: !this.state.visible,
        srcUrl: prevItem,
        num: prevNum || 0
      });
    }

    return this.setState({ visible: !this.state.visible });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  arrowClick = (click, e) => {
    e.stopPropagation();

    const { switchItem, imagesLength } = this.props;
    const { visible } = this.state;

    let srcUrl;
    let num;

    if (visible && switchItem && imagesLength !== undefined) {
      num = imagesLength - 1;
      srcUrl = switchItem(imagesLength - 1);

      if (0 <= this.state.num - 1) {
        num = this.state.num - 1;
        srcUrl = switchItem(num);
      }

      if (click === 'right') {
        num = 0;
        srcUrl = switchItem(0);

        if (imagesLength > this.state.num + 1) {
          num = this.state.num + 1;

          srcUrl = switchItem(num) || '';
        }
      }
    }

    this.setState({ srcUrl, num });
  };

  handleKeydown = e => {
    const { src } = this.props;
    const { visible } = this.state;

    if (e.keyCode === KEYCODES.ESCAPE && visible) {
      this.setState({ visible: false }); this.setState({ visible: false, srcUrl: src || '' });
    }

    if ((e.keyCode === 37 || e.keyCode === 39) && visible) {
      if (visible) {
        if (e.keyCode === 39) {
          this.arrowClick('right', e);
          return this.arrowClick('right', e);
        }

        if (e.keyCode === 37) {
          this.arrowClick('left', e);
          return this.arrowClick('left', e);
        }
      }
    }
  };

  renderDirectionButton = (direction: 'right' | 'left') => {
    if (direction === 'left') {
      return (
        <ButtonDirection
          arrow={direction}
          onClick={this.arrowClick.bind(this, direction)}
        >
          <Icon icon='leftarrow-3' />
        </ButtonDirection>
      );
    }

    return (
      <ButtonDirection
        arrow={direction}
        onClick={this.arrowClick.bind(this, direction)}
      >
        <Icon icon='chevron' />
      </ButtonDirection>
    );
  };

  renderBtn = () => {
    const { imagesLength } = this.props;

    if (imagesLength !== undefined && imagesLength > 1) {
      return (
        <>
          {this.renderDirectionButton('right')}
          {this.renderDirectionButton('left')}
        </>
      );
    }
    return null;
  };

  renderPreviewPortal = () => {
    const { alt } = this.props;
    const { srcUrl } = this.state;

    if (!this.state.visible) {
      return null;
    }

    return (
      <PreviewPortal>
        <PreviewWrapper onClick={this.toggleImage}>
          <img
            alt={alt}
            onClick={this.toggleImage}
            src={readFile(srcUrl || '')}
          />
          {this.renderBtn()}x{' '}
        </PreviewWrapper>
      </PreviewPortal>
    );
  };

  render() {
    const { onLoad } = this.props;

    return (
      <>
        <Image
          {...this.props}
          src={readFile(this.props.src || '')}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />

        {this.renderPreviewPortal()}
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
