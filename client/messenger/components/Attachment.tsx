import * as React from 'react';
import { iconAttach } from '../../icons/Icons';
import { IAttachment } from '../types';

function Attachment({ attachment }: { attachment: IAttachment }) {
  function renderAtachment() {
    const attachmentName = attachment.url || '';
    const fileExtension = attachmentName.split('.').pop() || '';

    if (['png', 'jpeg', 'jpg'].indexOf(fileExtension) > -1) {
      return <img role="presentation" src={attachment.url} />;
    }

    return (
      <div className="file-wrapper">
        {iconAttach}
        <span>{attachment.name}</span>
      </div>
    );
  }

  return (
    <a
      className="download-attachment"
      href={attachment.url}
      target="_blank"
      title="Download"
      rel="noopener noreferrer"
    >
      {renderAtachment()}
    </a>
  );
}

export default Attachment;
