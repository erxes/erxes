import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import colors from 'modules/common/styles/colors';
import * as React from 'react';
import styled from 'styled-components';

const Iframe = styled.iframe`
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

type Props = {
  videoUrl: string;
  name?: string;
  thumbImage?: string;
  onVideoClick: () => void;
};

class VideoPopup extends React.Component<Props> {
  render() {
    const trigger = <Button>asdasd</Button>;

    const content = () => (
      <Iframe
        key={this.props.name}
        title={this.props.name}
        src={this.props.videoUrl}
      />
    );

    return (
      <>
        <ModalTrigger
          hideHeader={true}
          title="asdasd"
          trigger={trigger}
          content={content}
          onExit={this.props.onVideoClick}
        />
      </>
    );
  }
}

export default VideoPopup;
