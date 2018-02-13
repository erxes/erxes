import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const PreviewWrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1000;

  img {
    max-width: 700px;
    width: 100%;
    margin: auto;
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
    const { src, alt, onLoad } = this.props;

    return (
      <div>
        <img onLoad={onLoad} alt={alt} src={src} onClick={this.toggleImage} />

        {this.state.visible && (
          <PreviewPortal>
            <PreviewWrapper onClick={this.toggleImage}>
              <img onLoad={onLoad} alt={alt} src={src} />
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
