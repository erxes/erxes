import React, { PropTypes, Component } from 'react';
import strip from 'strip';
import Editor from './Editor';
import { NameCard } from '/imports/react-ui/common';

const propTypes = {
  content: PropTypes.string,
  onContentChange: PropTypes.func.isRequired,
  user: PropTypes.object,
  sentAs: PropTypes.string,
};

class MessengerPreview extends Component {
  constructor(props) {
    super(props);
    this.state = { fromUser: '', messengerContent: props.content || '' };
    // binds
    this.onContentChange = this.onContentChange.bind(this);
  }

  onContentChange(content) {
    this.props.onContentChange(content);
    this.setState({ messengerContent: content });
  }

  render() {
    const { content, sentAs } = this.props;
    const classNames = `widget-preview engage-message type-${sentAs}`;
    return (
      <div className="flex-content">
        <div className="messenger-content">
          <h2>Content</h2>
          <Editor defaultValue={content} onChange={this.onContentChange} />
        </div>
        <div className={`web-preview type-${sentAs}`}>
          <h2>Preview</h2>
          <div className="messenger-preview">
            {sentAs != 'badge'
              ? <div className={classNames}>
                  <NameCard user={this.props.user} singleLine />
                  <div
                    className="preview-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        sentAs == 'snippet'
                          ? strip(this.state.messengerContent)
                          : this.state.messengerContent,
                    }}
                  />
                </div>
              : null}
            <div className="logo-container">
              <span>1</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MessengerPreview.propTypes = propTypes;

export default MessengerPreview;
