import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import { __, getEnv } from 'coreui/utils';
import React from 'react';
import { IPost } from '../../types';

type Props = {
  post: IPost;
  remove: (postId: string) => void;
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

    const content = props => <></>;

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
    const { post, remove } = this.props;

    const onClick = () => remove(post._id);

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
    const { post } = this.props;

    return (
      <tr>
        <td>{post.title}</td>
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
