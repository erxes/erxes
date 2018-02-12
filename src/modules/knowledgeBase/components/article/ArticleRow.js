import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  ModalTrigger,
  Tip,
  Button,
  Icon,
  Label
} from 'modules/common/components';
import { ArticleForm } from '../../containers';
import {
  Row,
  ArticleTitle,
  ArticleColumn,
  ArticleAuthor,
  ArticleSummary,
  ActionButtons,
  AuthorImg,
  AuthorName
} from '../../styles';

const propTypes = {
  article: PropTypes.object.isRequired,
  queryParams: PropTypes.object,
  currentCategoryId: PropTypes.string,
  topicIds: PropTypes.string,
  remove: PropTypes.func.isRequired
};

class ArticleRow extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    this.props.remove(this.props.article._id);
  }

  renderEditAction() {
    const { article, queryParams, currentCategoryId, topicIds } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size="large" title="Edit" trigger={editTrigger}>
        <ArticleForm
          article={article}
          queryParams={queryParams}
          currentCategoryId={currentCategoryId}
          topicIds={topicIds}
        />
      </ModalTrigger>
    );
  }

  render() {
    const { article } = this.props;
    return (
      <Row>
        <ArticleColumn>
          <ArticleTitle>{article.title}</ArticleTitle>
          {article.status === 'draft' && (
            <Label lblStyle="simple">{article.status}</Label>
          )}
          <ArticleSummary>{article.summary}</ArticleSummary>
          <ArticleAuthor>
            <AuthorImg
              src={
                article.createdUser.details.avatar ||
                '/images/avatar-colored.svg'
              }
            />
            Written By
            <AuthorName>
              {article.createdUser.details.fullName || ''}
            </AuthorName>
            Created {moment(article.createdDate).fromNow()} ago
          </ArticleAuthor>
        </ArticleColumn>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="close" />
          </Tip>
        </ActionButtons>
      </Row>
    );
  }
}

ArticleRow.propTypes = propTypes;

export default ArticleRow;
