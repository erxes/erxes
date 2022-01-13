import Spinner from '@erxes/ui/src/components/Spinner';
import { colors } from '@erxes/ui/src/styles';
import { IAttachmentPreview } from '@erxes/ui/src/types';
import React from 'react';
import styled from 'styled-components';

const Preview = styled.div`
  max-width: 360px;
  padding: 20px;
  background: ${colors.colorSecondary};
  margin: 5px 55px 0 auto;
  display: inline-block;
  box-shadow: 0 1px 5px 0 ${colors.darkShadow};
  border-radius: 20px;
  position: relative;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -12px;
    margin-top: -12px;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
`;

const File = styled.span`
  width: 80px;
  height: 50px;
  display: block;
`;

type Props = {
  attachmentPreview: IAttachmentPreview;
  onLoad: () => void;
};

class AttachmentPreview extends React.Component<Props, {}> {
  renderContent() {
    const { attachmentPreview, onLoad } = this.props;

    if (!attachmentPreview) {
      return null;
    }

    if (attachmentPreview.type.startsWith('image')) {
      return (
        <img
          onLoad={onLoad}
          alt={attachmentPreview.name}
          src={attachmentPreview.data}
        />
      );
    }

    return <File />;
  }

  render() {
    const { attachmentPreview } = this.props;

    if (!(attachmentPreview && attachmentPreview.data)) {
      return null;
    }

    return (
      <Preview>
        {this.renderContent()}
        <Spinner />
      </Preview>
    );
  }
}

export default AttachmentPreview;
