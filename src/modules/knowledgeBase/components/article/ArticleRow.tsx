import {
  Button,
  Icon,
  Label,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
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
  remove: (_id: string) => void;
};

class ArticleRow extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    this.props.remove(this.props.article._id);
  }

  renderEditAction(editTrigger) {
    const { article, queryParams, currentCategoryId, topicIds } = this.props;

    const editButton = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        size="large"
        title="Edit"
        trigger={editTrigger ? editTrigger : editButton}
        content={props => (
          <ArticleForm
            {...props}
            article={article}
            queryParams={queryParams}
            currentCategoryId={currentCategoryId}
            topicIds={topicIds}
          />
        )}
      />
    );
  }

  render() {
    const { article } = this.props;
    const user = article.createdUser;

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
          {this.renderEditAction(title)}
          <p>{article.summary}</p>
          <ArticleMeta>
            <img
              alt={(user.details && user.details.fullName) || 'author'}
              src={
                (article.createdUser.details &&
                  article.createdUser.details.avatar) ||
                '/images/avatar-colored.svg'
              }
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
          {this.renderEditAction('')}
          <Tip text={__('Delete')}>
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </RowArticle>
    );
  }
}

export default ArticleRow;
