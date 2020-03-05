import React from "react";
import styled from "styled-components";
import { IAttachment } from "../types";
import { readFile } from "../utils";
import ImageGallery from "./ImageGallery";

const Image = styled.img`
  cursor: zoom-in;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

type Props = {
  images: IAttachment[];
  defaultImage?: IAttachment;
  onLoad?: () => void;
};

type State = {
  visible: boolean;
};

export default class ImageWithPreview extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  toggleImage = () => {
    return this.setState({ visible: !this.state.visible });
  };

  getDefaultImage = () => {
    const { defaultImage, images } = this.props;

    if (defaultImage) {
      return defaultImage;
    }

    return images.length > 0 ? images[0] : { name: '', url: '', type: '' };
  }

  getDefaultIndex = () => {
    const index = this.props.images.indexOf(this.getDefaultImage());

    if (index === -1) {
      return 0;
    }

    return index;
  }

  render() {
    const { images, onLoad } = this.props;

    return (
      <>
        <Image
          {...this.props}
          src={readFile(this.getDefaultImage().url || '')}
          onLoad={onLoad}
          onClick={this.toggleImage}
        />

        <ImageGallery
          toggleImage={this.toggleImage}
          defaultIndex={this.getDefaultIndex()}
          defaultImage={this.getDefaultImage()}
          images={images}
          visible={this.state.visible} />
      </>
    );
  }
}