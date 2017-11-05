import React, { Component } from 'react';
import PropTypes from 'prop-types';
import strip from 'strip';

import { NameCard } from 'modules/common/components';
import { WebPreview, PreviewContent, Messenger } from '../styles';

const propTypes = {
  content: PropTypes.string,
  user: PropTypes.object,
  sentAs: PropTypes.string
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
    const isFullmessage = sentAs === 'fullMessage';
    if (sentAs !== 'badge') {
      return (
        <div className={classNames}>
          <NameCard user={this.props.user} singleLine />
          <PreviewContent
            isFullmessage={isFullmessage}
            dangerouslySetInnerHTML={{
              __html: isFullmessage ? content : strip(content)
            }}
          />
        </div>
      );
    }

    return null;
  }

  render() {
    const { sentAs } = this.props;
    return (
      <WebPreview className={`type-${sentAs}`}>
        <Messenger>
          {this.renderNotificationBody()}
          <div className="logo-container">
            <span>1</span>
          </div>
        </Messenger>
      </WebPreview>
    );
  }
}

MessengerPreview.propTypes = propTypes;

export default MessengerPreview;
