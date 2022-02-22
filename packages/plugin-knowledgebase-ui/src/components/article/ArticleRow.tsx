import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __, getUserAvatar } from 'coreui/utils';
import React from 'react';
import ArticleForm from '../../containers/article/ArticleForm';
import { IArticle } from '@erxes/ui-knowledgeBase/src/types';
import {
  ArticleMeta,
  ArticleTitle,
  AuthorName,
  ReactionCount,
  ReactionCounts,
  RowArticle
} from './styles';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { Column } from '@erxes/ui/src/styles/main';

type Props = {
  article: IArticle;
  queryParams: any;
  currentCategoryId: string;
  topicId: string;
  remove: (articleId: string) => void;
};

const ArticleRow = (props: Props) => {
  const { article } = props;
  const user = article.createdUser;

  const remove = () => {
    return props.remove(props.article._id);
  };

  const renderReactions = () => {
    const reactions = Object.entries(props.article.reactionCounts || {});

    return reactions.map(([key, value]) => (
      <ReactionCount key={key}>
        <img src={key} alt="reaction" /> {value}
      </ReactionCount>
    ));
  };

  const renderEditAction = editTrigger => {
    const { queryParams, currentCategoryId, topicId } = props;

    const editButton = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = contentProps => (
      <ArticleForm
        {...contentProps}
        article={props.article}
        queryParams={queryParams}
        currentCategoryId={currentCategoryId}
        topicId={topicId}
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
    <ArticleTitle>
      {article.title}
      {article.status === 'draft' && (
        <Label lblStyle="simple">{article.status}</Label>
      )}
    </ArticleTitle>
  );

  return (
    <RowArticle>
      <Column>
        {renderEditAction(title)}
        <p>{article.summary}</p>
        <ArticleMeta>
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
        </ArticleMeta>
      </Column>
      <ActionButtons>
        {renderEditAction('')}
        <Tip text={__('Delete')}>
          <Button btnStyle="link" onClick={remove} icon="cancel-1" />
        </Tip>
      </ActionButtons>
    </RowArticle>
  );
};

export default ArticleRow;
