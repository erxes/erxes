import React, { PropTypes } from 'react';

export default class ArticleDetail extends React.Component {

  renderArticle() {
    const { articleData } = this.props;
    console.log('this.props: ', this.props);
    return (
      <div className="erxes-article detail">
        <h1>{articleData.title}</h1>
        <div className="erxes-article-content">
          <p>{articleData.summary}</p>
          <p>{articleData.content}</p>
        </div>
      </div>
    );
  }

  render() {
    return this.renderArticle();
  }
}

ArticleDetail.propTypes = {
  articleData: PropTypes.object, // eslint-disable-line
};
