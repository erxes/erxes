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
    line-height: 46px;
    width: 46px;
    height: 46px;
    color: ${colors.colorCoreRed};
    left: 50%;
    top: 50%;
    margin-left: -23px;
    margin-top: -23px;
    opacity: 0.9;
    font-size: 46px;
    transition: opacity ease 0.3s;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -6px;
      margin-top: -7px;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      border-left: 14px solid ${colors.colorWhite};
    }
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
        <Icon icon="youtube-play" />
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
