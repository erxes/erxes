import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import colors from 'modules/common/styles/colors';
import * as React from 'react';
import styled from 'styled-components';

const Iframe = styled.iframe.attrs({
  allow:
    'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
})`
  border: none;
  background: ${colors.colorWhite};
  width: 100%;
  height: 360px;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px;
  overflow: hidden;
`;

const Thumbnail = styled.div`
  margin-bottom: 10px;
  position: relative;

  img {
    width: 100%;
    border-radius: 5px;
  }

  &:hover {
    cursor: pointer;

    i {
      opacity: 1;
    }
  }

  i {
    position: absolute;
    background: ${colors.colorCoreRed};
    width: 50px;
    height: 36px;
    border-radius: 12px;
    color: ${colors.colorWhite};
    line-height: 36px;
    text-align: center;
    left: 50%;
    top: 50%;
    margin-left: -25px;
    margin-top: -18px;
    opacity: 0.9;
    font-size: 16px;
    transition: opacity ease 0.3s;
  }
`;

type Props = {
  videoUrl: string;
  name?: string;
  thumbImage: string;
  onVideoClick: () => void;
};

class VideoPopup extends React.Component<Props> {
  render() {
    const { thumbImage, name, videoUrl, onVideoClick } = this.props;

    const trigger = (
      <Thumbnail>
        <Icon icon="play-1" />
        <img src={thumbImage} alt={name} />
      </Thumbnail>
    );

    const content = () => <Iframe key={name} title={name} src={videoUrl} />;

    return (
      <>
        <ModalTrigger
          hideHeader={true}
          title={name || ''}
          trigger={trigger}
          content={content}
          onExit={onVideoClick}
        />
      </>
    );
  }
}

export default VideoPopup;
