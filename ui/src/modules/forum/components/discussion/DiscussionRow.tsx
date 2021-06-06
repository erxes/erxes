import React from 'react';
import dayjs from 'dayjs';

import ModalTrigger from 'modules/common/components/ModalTrigger';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { getUserAvatar } from 'modules/common/utils';

import Tip from 'modules/common/components/Tip';

import Label from 'modules/common/components/Label';

import {
  DiscussionColumn,
  RowDiscussion,
  ActionButtons,
  DiscussionTitle,
  AuthorName,
  DiscussionMeta
} from './styles';
import { DiscussionForm } from '../../containers/discussion';
import { IDiscussion } from '../../types';
import DiscussionDetail from './DiscussionDetail';

type Props = {
  queryParams: any;
  currentTopicId: string;
  discussion: IDiscussion;
  remove: (discussionId) => void;
  forumId: string;
};

const DiscussionRow = (props: Props) => {
  const { discussion, currentTopicId, queryParams, forumId } = props;

  const user = discussion.createdUser;

  const remove = () => {
    return props.remove(discussion._id);
  };

  const renderDetail = editTrigger => {
    const detailButton = (
      <Button btnStyle="link">
        <Tip text={'Edit'}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = contentProps => (
      <DiscussionDetail {...contentProps} discussion={discussion} />
    );

    return (
      <ModalTrigger
        size="lg"
        title="Comments"
        trigger={editTrigger ? editTrigger : detailButton}
        content={content}
        enforceFocus={false}
      />
    );
  };

  const renderEditAction = editTrigger => {
    const editButton = (
      <Button btnStyle="link">
        <Tip text={'Edit'}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = contentProps => (
      <DiscussionForm
        {...contentProps}
        discussion={discussion}
        currentTopicId={currentTopicId}
        queryParams={queryParams}
        forumId={forumId}
      />
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger ? editTrigger : editButton}
        content={content}
        enforceFocus={false}
      />
    );
  };

  const title = (
    <DiscussionTitle>
      {discussion.title}
      <Label lblStyle="simple">{'tag'}</Label>
    </DiscussionTitle>
  );

  return (
    <RowDiscussion>
      <DiscussionColumn>
        {renderDetail(title)}
        <p>{discussion.description}</p>
        <DiscussionMeta>
          <img
            alt={(user && user.details && user.details.fullName) || 'author'}
            src={getUserAvatar(user)}
          />
          {'Created By'}
          <AuthorName>
            {user &&
              ((user.details && user.details.fullName) ||
                user.username ||
                user.email)}
          </AuthorName>
          <Icon icon="clock-eight" /> {'Created'}{' '}
          {dayjs(discussion.createdDate).format('ll')}
        </DiscussionMeta>
      </DiscussionColumn>
      <ActionButtons>
        {renderEditAction('')}
        <Tip text={'Delete'}>
          <Button btnStyle="link" icon="cancel-1" onClick={remove} />
        </Tip>
      </ActionButtons>
    </RowDiscussion>
  );
};

export default DiscussionRow;
