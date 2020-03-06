import { fadeIn, slideDown } from 'modules/common/utils/animations';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '../styles/colors';
import { IAttachment } from '../types';
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
    background: ${colors.colorWhite};
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 20px;
    opacity: .5;

    > i {
      font-size: 16px;
    }

    &:hover {
      background: ${colors.colorCoreLightGray};
    }
`;

const KEYCODES = {
  ESCAPE: 27
};

type Props = {
  visible: boolean;
  images: IAttachment[];
  defaultImage: IAttachment;
  toggleImage: () => void;
};

type State = {
  currentIndex: number;
  currentImage: IAttachment;
};

class ImageGallery extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: this.getDefaultIndex(),
      currentImage: props.defaultImage
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  getDefaultIndex = () => {
    const index = this.props.images.indexOf(this.props.defaultImage);

    if (index === -1) {
      return 0;
    }

    return index;
  };

  getItem = (index: number) => {
    return this.props.images[index];
  };

  arrowClick = (direction, e) => {
    e.stopPropagation();

    const imagesLength = this.props.images.length;
    const { currentIndex } = this.state;
    let updateIndex = currentIndex;

    if (direction === 'right') {
      if (currentIndex === imagesLength - 1) {
        updateIndex = 0;
      } else {
        updateIndex++;
      }
    } else {
      if (currentIndex === 0) {
        updateIndex = imagesLength - 1;
      } else {
        updateIndex--;
      }
    }

    this.setState({
      currentImage: this.getItem(updateIndex),
      currentIndex: updateIndex
    });
  };

  handleKeydown = e => {
    e.stopPropagation();

    if (e.keyCode === KEYCODES.ESCAPE) {
      this.props.toggleImage();
    }

    if (e.keyCode === 37 || e.keyCode === 39) {
      if (e.keyCode === 39) {
        this.arrowClick('right', e);
      }

      if (e.keyCode === 37) {
        this.arrowClick('left', e);
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
          <Icon icon="leftarrow" />
        </ButtonDirection>
      );
    }

    return (
      <ButtonDirection
        arrow={direction}
        onClick={this.arrowClick.bind(this, direction)}
      >
        <Icon icon="rightarrow" />
      </ButtonDirection>
    );
  };

  renderBtn = () => {
    const { images } = this.props;

    if (images.length > 1) {
      return (
        <>
          {this.renderDirectionButton('right')}
          {this.renderDirectionButton('left')}
        </>
      );
    }

    return null;
  };

  render() {
    const { currentImage } = this.state;
    const { visible, toggleImage } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <PreviewPortal>
        <PreviewWrapper onClick={toggleImage}>
          <img
            alt={currentImage.name}
            onClick={toggleImage}
            src={readFile(currentImage.url || '')}
          />
          {this.renderBtn()}x{' '}
        </PreviewWrapper>
      </PreviewPortal>
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

export default ImageGallery;
