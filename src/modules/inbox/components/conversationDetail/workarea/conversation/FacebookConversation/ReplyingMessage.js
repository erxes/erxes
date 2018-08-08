import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl } from 'modules/common/components';
import { Footer } from './styles';

const propTypes = {
  replyPost: PropTypes.func,
  likePost: PropTypes.func,
  commentId: PropTypes.string,
  postId: PropTypes.string,
  currentUserName: PropTypes.string,
  integrationId: PropTypes.string
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class ReplyingMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      post: ''
    };

    this.doAction = this.doAction.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  onContentChange(e) {
    const tweetContent = e.target.value;
    this.setState({
      post: tweetContent
    });
  }

  getContent() {
    const { currentUserName } = this.props;

    return `@${currentUserName} `;
  }

  doAction(e) {
    e.preventDefault();

    const { replyPost } = this.props;

    const replyData = {
      conversationId: this.props.commentId || this.props.postId,
      content: this.state.post
    };

    return replyPost(replyData, () => {
      this.context.closeModal();
    });
  }

  render() {
    return (
      <form onSubmit={this.doAction}>
        <FormGroup>
          <FormControl
            autoFocus
            componentClass="textarea"
            onChange={this.onContentChange}
            defaultValue={this.getContent()}
            required
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Post
          </Button>
        </Footer>
      </form>
    );
  }
}

ReplyingMessage.propTypes = propTypes;
ReplyingMessage.contextTypes = contextTypes;

export default ReplyingMessage;
