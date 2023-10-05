import * as React from 'react';
import { iconAttach } from '../../../icons/Icons';
import { readFile } from '../../../utils';
import { IAttachment } from '../../types';
import ImageView from './ImageView';

function Attachment({ attachment }: { attachment: IAttachment }) {
  function renderAttachment() {
    const attachmentName = attachment.url || '';
    const fileExtension = attachmentName.split('.').pop() || '';

    if (['png', 'jpeg', 'jpg'].indexOf(fileExtension) > -1) {
      return <ImageView imageUrl={readFile(attachment.url)} />;
    }

    return (
      <a
        className='download-attachment'
        href={readFile(attachment.url)}
        target='_blank'
        title='Download'
        rel='noopener noreferrer'
      >
        <div className='file-wrapper'>
          {iconAttach}
          <span>{attachment.name}</span>
        </div>
      </a>
    );
  }

  return <>{renderAttachment()}</>;
}

export default Attachment;
