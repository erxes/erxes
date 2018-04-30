import React from 'react';
import PropTypes from 'prop-types';
import { iconAttach } from '../../icons/Icons';


const propTypes = {
  attachment: PropTypes.object.isRequired,
};

function Attachment({ attachment }) {
  function renderAtachment() {
    const attachmentName = attachment.url || '';
    const fileExtension = attachmentName.split('.').pop();

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

Attachment.propTypes = propTypes;

export default Attachment;
