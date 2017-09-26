import React, { Component } from 'react';
import PropTypes from 'prop-types';
import strip from 'strip';

import { NameCard } from '/imports/react-ui/common';

const propTypes = {
  content: PropTypes.string,
  user: PropTypes.object,
  sentAs: PropTypes.string,
};

class MessengerPreview extends Component {
  constructor(props) {
    super(props);
    this.state = { fromUser: '' };

    // binds
    this.renderNotificationBody = this.renderNotificationBody.bind(this);
  }

  renderNotificationBody() {
    const { content, sentAs } = this.props;
    const type = sentAs ? sentAs : 'default';
    const classNames = `widget-preview engage-message type-${type}`;

    if (sentAs != 'badge') {
      return (
        <div className={classNames}>
          <NameCard user={this.props.user} singleLine />
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: sentAs == 'snippet' ? strip(content) : content }}
          />
        </div>
      );
    }

    return null;
  }

  render() {
    const { sentAs } = this.props;
    return (
      <div className={`web-preview type-${sentAs}`}>
        <h2>Preview</h2>
        <div className="messenger-preview">
          {this.renderNotificationBody()}
          <div className="logo-container">
            <span>1</span>
          </div>
        </div>
      </div>
    );
  }
}

MessengerPreview.propTypes = propTypes;

export default MessengerPreview;
