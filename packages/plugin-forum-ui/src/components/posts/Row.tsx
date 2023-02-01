import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IPost } from '../../types';
import PostForm from '../../containers/PostsList/PostForm';
import { Link } from 'react-router-dom';

type Props = {
  post: IPost;
  remove: (postId: string, emptyBulk: () => void) => void;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
  emptyBulk: () => void;
};

class Row extends React.Component<Props> {
  renderEditAction(post) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => <PostForm {...props} post={post} />;

    return (
      <ModalTrigger
        title={`Edit Post`}
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }

  renderRemoveAction() {
    const { post, remove, emptyBulk } = this.props;

    const onClick = () => remove(post._id, emptyBulk);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="postDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  }

  render() {
    const { post, isChecked, toggleBulk } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(post, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    return (
      <tr>
        <td id="customersCheckBox" style={{ width: '50px' }} onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>
          <Link to={`/forums/posts/${post._id}`}>{post.title}</Link>
        </td>
        <td>{post.state}</td>
        <td>{post.stateChangedAt}</td>
        <td>{post.stateChangedBy.username}</td>
        <td>{post.createdAt}</td>
        <td>{post.createdBy.username}</td>
        <td>{post.updatedAt}</td>
        <td>{post.updatedBy.username}</td>
        <td>{post.commentCount}</td>
        <td>{post.upVoteCount}</td>
        <td>{post.downVoteCount}</td>
        <td>{post.viewCount}</td>
        <td>
          <ActionButtons>
            {this.renderEditAction(post)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
