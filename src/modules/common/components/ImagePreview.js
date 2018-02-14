import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const fade = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const slidedown = keyframes`
  0% {
    transform: translateY(-20px);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const PreviewWrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  z-index: 10;
  animation-name: ${fade};
  animation-duration: 0.4s;
  animation-timing-function: ease;
  cursor: zoom-out;

  img {
    width: auto;
    max-width: 80%;
    max-height: 80%;
    max-height: 80vh;
    transition: max-width 0.1s ease, max-height 0.1s ease;
    animation-name: ${slidedown};
    animation-duration: 0.3s;
    animation-timing-function: ease;
  }
`;

const Image = styled.img`
  cursor: zoom-in;
  transition: all 0.4s;

  &:hover {
    opacity: 0.8;
  }
`;

class PreviewPortal extends Component {
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

PreviewPortal.propTypes = {
  children: PropTypes.node
};

class ImagePreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };

    this.toggleImage = this.toggleImage.bind(this);
  }

  toggleImage() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const { src, alt } = this.props;

    return (
      <div>
        <Image {...this.props} onClick={this.toggleImage} />

        {this.state.visible && (
          <PreviewPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img alt={alt} src={src} />
            </PreviewWrapper>
          </PreviewPortal>
        )}
      </div>
    );
  }
}

ImagePreview.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  onLoad: PropTypes.func
};

export default ImagePreview;
