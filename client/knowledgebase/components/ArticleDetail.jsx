import React, { PropTypes } from 'react';

export default class ArticleDetail extends React.Component {

  renderArticle() {
    const { data } = this.props;
    return (
      <div className="erxes-article detail">
        <h1>{data.title}</h1>
        <div className="erxes-article-content">
          <p>{data.summary}</p>
          <p>{data.content}</p>
        </div>
      </div>
    );
  }

  render() {
    return this.renderArticle();
  }
}

ArticleDetail.propTypes = {
  data: PropTypes.object, // eslint-disable-line
};
