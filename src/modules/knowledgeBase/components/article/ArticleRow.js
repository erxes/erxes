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
    const { __ } = this.context;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
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
    const user = article.createdUser;
    const { __ } = this.context;

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
            {__('Written By')}
            <AuthorName>
              {user.details.fullName || user.username || user.email}
            </AuthorName>
            {__('Created')} {moment(article.createdDate).format('ll')}
          </ArticleAuthor>
        </ArticleColumn>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text={__('Delete')}>
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </Row>
    );
  }
}

ArticleRow.propTypes = propTypes;
ArticleRow.contextTypes = {
  __: PropTypes.func
};

export default ArticleRow;
