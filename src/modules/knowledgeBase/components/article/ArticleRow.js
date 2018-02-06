import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ActionButtons,
  ModalTrigger,
  Tip,
  Button,
  Icon
} from 'modules/common/components';
import { ArticleForm } from '../../containers';
import {
  Row,
  ArticleTitle,
  ArticleColumn,
  ArticleAuthor,
  ArticleSummary,
  AuthorImg,
  AuthorName
} from '../../styles';

const propTypes = {
  articlesQuery: PropTypes.object.isRequired,
  article: PropTypes.object.isRequired,
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
    const { article, articlesQuery } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size="large" title="Edit" trigger={editTrigger}>
        <ArticleForm articlesQuery={articlesQuery} article={article} />
      </ModalTrigger>
    );
  }

  render() {
    const { article } = this.props;

    return (
      <Row>
        <ArticleColumn>
          <ArticleTitle>{article.title}</ArticleTitle>
          <ArticleSummary>{article.summary}</ArticleSummary>
          <ArticleAuthor>
            <AuthorImg src={'/images/avatar-colored.svg'} />
            Written By <AuthorName>Mend-Orshikh Amartaivan</AuthorName>
            Created a {article.createdDate}
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
