import React, { PropTypes } from 'react';


const propTypes = {
  path: PropTypes.string.isRequired,
};

class Attachment extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.renderAtachment = this.renderAtachment.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
  }

  renderAtachment(path) {
    const filename = path.split('/').pop();
    const fileExtension = path.split('.').pop();

    let filePreview;
    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
        filePreview = (
          <img role="presentation" src={path} />
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
            <i className="ion-document-text" /> <span>{filename}</span>
          </div>
        );
        break;
      case 'mp4':
      case 'avi':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-videocamera" /> <span>{filename}</span>
          </div>
        );
        break;
      case 'mp3':
      case 'wav':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-volume-medium" /> <span>{filename}</span>
          </div>
        );
        break;
      case 'zip':
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-android-archive" /> <span>{filename}</span>
          </div>
        );
        break;
      default:
        filePreview = (
          <div className="file-wrapper">
            <i className="ion-document" /> <span>{filename}</span>
          </div>
        );
    }
    return filePreview;
  }

  render() {
    return (
      <a className="download-attachment" href={this.props.path} target="_blank">
        {this.renderAtachment(this.props.path)}
        <i className="ion-android-download" />
      </a>
    );
  }
}

Attachment.propTypes = propTypes;

export default Attachment;
