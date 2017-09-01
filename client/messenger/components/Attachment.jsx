import React, { PropTypes } from 'react';
import Ionicon from 'react-ionicons';


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
        <Ionicon icon="ion-android-attach" fontSize="18px" />
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
