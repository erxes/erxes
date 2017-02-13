import React, { PropTypes } from 'react';


const propTypes = {
  attachment: PropTypes.object.isRequired,
};

function Attachment({ attachment }) {
  function renderAtachment() {
    const fileExtension = attachment.url.split('.').pop();

    if (['png', 'jpeg', 'jpg'].indexOf(fileExtension) > -1) {
      return <img role="presentation" src={attachment.url} />;
    }

    return (
      <div className="file-wrapper">
        <i className="file" /> <span>{attachment.name}</span>
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
