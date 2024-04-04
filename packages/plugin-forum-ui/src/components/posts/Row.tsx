import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { DetailLink } from '../../styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPost } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PostForm from '../../containers/posts/PostForm';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';

type Props = {
  post: IPost;
  remove: (postId: string, emptyBulk?: () => void) => void;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
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
        enforceFocus={false}
      />
    );
  }

  renderRemoveAction() {
    const { post, remove } = this.props;

    const onClick = () => remove(post._id || '');

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
    const {
      title,
      _id,
      state,
      lastPublishedAt,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      commentCount,
      upVoteCount,
      downVoteCount,
      viewCount
    } = post;

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
        <td id="postsCheckBox" onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>
          <DetailLink>
            <Link to={`/forums/posts/${_id}`}>{title}</Link>
          </DetailLink>
        </td>
        <td>{state}</td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>{dayjs(lastPublishedAt).format('ll')}</DateWrapper>
        </td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>{dayjs(createdAt).format('ll')}</DateWrapper>
        </td>
        <td>{createdBy ? createdBy.username : ''}</td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>{dayjs(updatedAt).format('ll')}</DateWrapper>
        </td>
        <td>{updatedBy ? updatedBy.username : ''}</td>
        <td>{(commentCount || 0).toLocaleString()}</td>
        <td>{(upVoteCount || 0).toLocaleString()}</td>
        <td>{(downVoteCount || 0).toLocaleString()}</td>
        <td>{(viewCount || 0).toLocaleString()}</td>
        <td>
          <ActionButtons>
            <Link to={`/forums/posts/${_id}`}>
              <Icon icon="eye" />
            </Link>
            {this.renderEditAction(post)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
