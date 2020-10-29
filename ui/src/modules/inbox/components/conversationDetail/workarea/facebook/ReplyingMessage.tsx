import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import * as React from 'react';
import { Footer } from './styles';

type Props = {
  replyComment: (
    data: {
      conversationId: string;
      commentId: string;
      content: string;
    },
    callback: () => void
  ) => void;
  changeHasReply: () => void;
  conversationId: string;
  commentId: string;
  currentUserName: string;
  closeModal: () => void;
};

type State = {
  post: string;
};

class ReplyingMessage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      post: ''
    };
  }

  onContentChange = (e: React.FormEvent<HTMLElement>) => {
    const postContent = (e.target as HTMLInputElement).value;

    this.setState({
      post: postContent
    });
  };

  doAction = (e: React.FormEvent) => {
    e.preventDefault();

    const { replyComment, conversationId, commentId } = this.props;

    const replyData = {
      conversationId,
      commentId,
      content: this.state.post
    };

    return replyComment(replyData, () => {
      this.props.changeHasReply();
      this.props.closeModal();
    });
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    return (
      <form onSubmit={this.doAction}>
        <FormGroup>
          <FormControl
            autoFocus={true}
            componentClass="textarea"
            onChange={this.onContentChange}
            required={true}
            onFocus={this.moveCursorAtTheEnd}
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="check-circle" uppercase={false}>
            Post
          </Button>
        </Footer>
      </form>
    );
  }
}

export default ReplyingMessage;
