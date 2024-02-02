import dayjs from 'dayjs';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import ArticleForm from '../../containers/article/ArticleForm';
import { IArticle } from '@erxes/ui-knowledgebase/src/types';
import {
  ArticleMeta,
  ArticleTitle,
  AuthorName,
  ReactionCount,
  ReactionCounts,
  RowArticle,
} from './styles';
import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { Column } from '@erxes/ui/src/styles/main';
import { __, getUserAvatar } from '@erxes/ui/src/utils';

type Props = {
  article: IArticle;
  queryParams: any;
  currentCategoryId: string;
  topicId: string;
  remove: (articleId: string) => void;
};

const ArticleRow = (props: Props) => {
  const { article, queryParams, currentCategoryId, topicId, remove } = props;
  const user = article.createdUser;

  const handleRemove = () => {
    remove(article._id);
  };

  const renderReactions = () => {
    const reactions = Object.entries(article.reactionCounts || {});

    return (
      <ReactionCounts>
        {reactions.map(([key, value]) => (
          <ReactionCount key={key}>
            <img src={key} alt="reaction" /> {value}
          </ReactionCount>
        ))}
      </ReactionCounts>
    );
  };

  const renderForm = (formProps) => (
    <ArticleForm
      {...formProps}
      article={article}
      queryParams={queryParams}
      currentCategoryId={currentCategoryId}
      topicId={topicId}
    />
  );

  const renderEditAction = (trigger) => {
    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={trigger}
        content={renderForm}
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

  const editButton = (
    <Button btnStyle="link">
      <Tip text={__('Edit')}>
        <Icon icon="edit" />
      </Tip>
    </Button>
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
          {renderReactions()}
        </ArticleMeta>
      </Column>
      <ActionButtons>
        {renderEditAction(editButton)}
        <Tip text={__('Delete')}>
          <Button btnStyle="link" onClick={handleRemove} icon="cancel-1" />
        </Tip>
      </ActionButtons>
    </RowArticle>
  );
};

export default ArticleRow;
