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
      default:
        filePreview = (
          <div className="file-wrapper">
            <i className="file" /> <span>{filename}</span>
          </div>
        );
    }
    return filePreview;
  }

  render() {
    return (
      <a
        className="download-attachment"
        href={this.props.path}
        target="_blank"
        title="Download"
        rel="noopener"
      >
        {this.renderAtachment(this.props.path)}
      </a>
    );
  }
}

Attachment.propTypes = propTypes;

export default Attachment;
