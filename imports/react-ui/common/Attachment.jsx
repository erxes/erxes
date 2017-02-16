import React, { PropTypes } from 'react';


const propTypes = {
  attachment: PropTypes.object.isRequired,
};

class Attachment extends React.Component {
  constructor(props) {
    super(props);

    this.renderAtachment = this.renderAtachment.bind(this);
  }

  renderAtachment({ attachment }) {
    // when facebook attachments, it is not possible to determine file type
    // from extension, so determine it by type property
    if (attachment.type === 'image/jpeg' || attachment.type === 'image/png') {
      return (
        <img role="presentation" src={attachment.url} />
      );
    }

    const fileExtension = attachment.url.split('.').pop();

    let filePreview;
    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
        filePreview = (
          <img role="presentation" src={attachment.url} />
        );
        break;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'pdf':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-document-text" /> <span>{attachment.name}</span>
          </div>
        );
        break;
      case 'mp4':
      case 'avi':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-videocamera" /> <span>{attachment.name}</span>
          </div>
        );
        break;
      case 'mp3':
      case 'wav':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-volume-medium" /> <span>{attachment.name}</span>
          </div>
        );
        break;
      case 'zip':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-android-archive" /> <span>{attachment.name}</span>
          </div>
        );
        break;
      default:
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-document" /> <span>{attachment.name}</span>
          </div>
        );
    }
    return filePreview;
  }

  render() {
    const props = this.props;
    return (
      <a className="download-attachment" href={props.attachment.url} target="_blank">
        {this.renderAtachment(props)}
        <div className="overlay">
          <div className="icon">
            <i className="ion-android-download" />
          </div>
        </div>
        <div className="file-size">
          {Math.round(props.attachment.size / 1000)}kB
        </div>
      </a>
    );
  }
}

Attachment.propTypes = propTypes;

export default Attachment;
