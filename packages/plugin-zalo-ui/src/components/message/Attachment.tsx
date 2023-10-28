import React from 'react';
import AttachmentBase from '@erxes/ui/src/components/Attachment';
import ImageWithPreview from '@erxes/ui/src/components/ImageWithPreview';

class Attachment extends AttachmentBase {
  constructor(props) {
    super(props);
  }

  renderImagePreview(attachment) {
    return (
      <ImageWithPreview
        onLoad={this.onLoadImage}
        alt={attachment.url}
        src={attachment.url}
      />
    );
  }
}

export default Attachment;
