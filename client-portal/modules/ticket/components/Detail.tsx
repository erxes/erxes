import React from 'react';
import { TextArea } from '../../common/form/styles';
import {
  TicketRow,
  TicketLabel,
  TicketContent,
  TicketComment,
  TicketDetailContent,
  CommentWrapper,
  CreatedUser,
  CommentContent
} from '../../styles/tickets';
import { IUser } from '../../types';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import dayjs from 'dayjs';
import { FormWrapper } from '../../styles/main';
import PriorityIndicator from '../../common/PriorityIndicator';
import Icon from '../../common/Icon';
import { readFile } from '../../../modules/common/utils';

type Props = {
  item?: any;
  comments?: any;
  currentUser: IUser;
  onClose: () => void;
  handleSubmit: ({ content }: { content: string }) => void;
  handleRemoveComment: (commentId: string) => void;
};

export default class TicketDetail extends React.Component<
  Props,
  { content: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      content: ''
    };
  }

  handleChange = e => {
    this.setState({ content: e.target.value });
  };

  createComment = () => {
    this.props.handleSubmit({ content: this.state.content });

    this.setState({ content: '' });
  };

  deleteComment = (commentId: string) => {
    this.props.handleRemoveComment(commentId);
  };

  renderContent(label, text) {
    switch (label) {
      case 'Priority':
        return (
          <>
            <PriorityIndicator value={text} /> {text}
          </>
        );
      default:
        return text;
    }
  }

  renderRow = (icon: string, label: string, text: string) => {
    return (
      <TicketRow>
        <TicketLabel>
          <Icon icon={icon} size={14} /> {label}
        </TicketLabel>
        <TicketContent>{this.renderContent(label, text)}</TicketContent>
      </TicketRow>
    );
  };

  renderComments(comments) {
    return (
      <CommentWrapper>
        {comments.map(comment => {
          const { createdUser = {} } = comment;

          return (
            <TicketComment key={comment._id}>
              <CreatedUser>
                <img src={readFile(createdUser?.avatar)} alt="profile" />
                <div>
                  <CommentContent>
                    <h5>{`${createdUser?.firstName} ${createdUser?.lastName}`}</h5>
                    <div
                      className="comment"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </CommentContent>
                  <span>
                    Reported{' '}
                    {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
                {createdUser?._id === this.props.currentUser._id && (
                  <div className="actions">
                    <span onClick={() => this.deleteComment(comment._id)}>
                      Delete
                    </span>
                  </div>
                )}
              </CreatedUser>
            </TicketComment>
          );
        })}
      </CommentWrapper>
    );
  }

  render() {
    const currentUser = this.props.currentUser || ({} as IUser);
    const { item, onClose, comments } = this.props;
    const email = currentUser.email;

    if (!item) {
      return null;
    }

    const { stage } = item;

    const content = () => (
      <FormWrapper>
        <h4>{item.name}</h4>
        <TicketDetailContent>
          {this.renderRow('file-question-alt', 'Requestor', email)}
          {this.renderRow('chart-growth', 'Priority', item.priority)}
          {this.renderRow(
            'align-left-justify',
            'Description',
            item.description
          )}
          {this.renderRow('notes', 'Stage', stage.name)}
          <TicketRow>
            <TicketLabel>
              {' '}
              <Icon icon="comment-1" size={14} />
              &nbsp; Activity
            </TicketLabel>
            <TicketContent>
              <TextArea
                onChange={this.handleChange}
                placeholder="Write a comment..."
                value={this.state.content}
              />
              {this.state.content.length !== 0 && (
                <div className="buttons">
                  <Button
                    btnStyle="success"
                    size="small"
                    icon="message"
                    onClick={this.createComment.bind(this, email)}
                  >
                    Save
                  </Button>
                </div>
              )}
              {this.renderComments(comments)}
            </TicketContent>
          </TicketRow>
        </TicketDetailContent>
      </FormWrapper>
    );

    return (
      <Modal content={content} onClose={onClose} isFull={true} isOpen={item} />
    );
  }
}
