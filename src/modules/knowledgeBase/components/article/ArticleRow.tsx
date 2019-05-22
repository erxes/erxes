import { IUserDoc } from 'modules/auth/types';
import {
  Button,
  Icon,
  Label,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { __, getUserAvatar, readFile } from 'modules/common/utils';
import * as moment from 'moment';
import * as React from 'react';
import { ArticleForm } from '../../containers';
import { IArticle } from '../../types';
import {
  ActionButtons,
  ArticleColumn,
  ArticleMeta,
  ArticleTitle,
  AuthorName,
  RowArticle
} from './styles';

type Props = {
  article: IArticle;
  queryParams: any;
  currentCategoryId: string;
  topicIds: string;
  remove: (articleId: string) => void;
};

const ArticleRow = (props: Props) => {
  const { article } = props;
  const user = article.createdUser;

  const remove = () => {
    return props.remove(props.article._id);
  };

  const renderEditAction = editTrigger => {
    const { queryParams, currentCategoryId, topicIds } = props;

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
        topicIds={topicIds}
      />
    );

    return (
      <ModalTrigger
        size="large"
        title="Edit"
        trigger={editTrigger ? editTrigger : editButton}
        content={content}
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
      <ArticleColumn>
        {renderEditAction(title)}
        <p>{article.summary}</p>
        <ArticleMeta>
          <img
            alt={(user.details && user.details.fullName) || 'author'}
            src={getUserAvatar(user)}
          />
          {__('Written By')}
          <AuthorName>
            {(user.details && user.details.fullName) ||
              user.username ||
              user.email}
          </AuthorName>
          <Icon icon="wallclock" /> {__('Created')}{' '}
          {moment(article.createdDate).format('ll')}
        </ArticleMeta>
      </ArticleColumn>
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
