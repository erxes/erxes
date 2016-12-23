import React, { PropTypes } from 'react';


const propTypes = {
  path: PropTypes.string.isRequired,
};

function Attachment({ path }) {
  function renderAtachment(filePath) {
    const filename = filePath.split('/').pop();
    const fileExtension = filePath.split('.').pop();

    if (['png', 'jpeg', 'jpg'].indexOf(fileExtension) > -1) {
      return <img role="presentation" src={filePath} />;
    }

    return (
      <div className="file-wrapper">
        <i className="file" /> <span>{filename}</span>
      </div>
    );
  }

  return (
    <a
      className="download-attachment"
      href={path}
      target="_blank"
      title="Download"
      rel="noopener noreferrer"
    >
      {renderAtachment(path)}
    </a>
  );
}

Attachment.propTypes = propTypes;

export default Attachment;
