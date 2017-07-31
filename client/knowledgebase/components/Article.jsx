import React, { PropTypes } from 'react';

export default class Article extends React.Component {
  renderArticle() {
    const { article } = this.props;
    console.log('article: ', article);
    return (
      <div>
        <div>{article.title}</div>
        <div>{article.summary}</div>
      </div>
    );
  }

  render() {
    return this.renderArticle();
  }
}

Article.propTypes = {
  article: PropTypes.object, // eslint-disable-line
};
