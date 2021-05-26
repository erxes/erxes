import React from 'react';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';

import Label from 'modules/common/components/Label';

import {
  DiscussionColumn,
  RowDiscussion,
  ActionButtons,
  DiscussionTitle
} from './styles';
import { DiscussionForm } from '../../containers/discussion';
import { IDiscussion } from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
  discussion: IDiscussion;
};

const DiscussionRow = (props: Props) => {
  const { discussion } = props;

  const renderEditAction = editTrigger => {
    const editButton = (
      <Button btnStyle="link">
        <Tip text={'Edit'}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = contentProps => <DiscussionForm />;

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
      <Label lblStyle="simple">{'hhh'}</Label>
    </DiscussionTitle>
  );

  return (
    <RowDiscussion>
      <DiscussionColumn>
        {renderEditAction(title)}
        <p>{discussion.description}</p>
        {/*   <ArticleMeta>
            <img
              alt={(user && user.details && user.details.fullName) || 'author'}
              src={getUserAvatar(user)}
            />
            {__('Written By')}
            <AuthorName>
              {user &&
                ((user.details && user.details.fullName) ||
                  user.username ||
                  user.email)}
            </AuthorName>
            <Icon icon="clock-eight" /> {__('Created')}{' '}
            {dayjs(article.createdDate).format('ll')}
            <ReactionCounts>{renderReactions()}</ReactionCounts>
          </ArticleMeta> */}
      </DiscussionColumn>
      <ActionButtons>
        {renderEditAction('')}
        <Tip text={'Delete'}>
          <Button btnStyle="link" icon="cancel-1" />
        </Tip>
      </ActionButtons>
    </RowDiscussion>
  );
};

export default DiscussionRow;
