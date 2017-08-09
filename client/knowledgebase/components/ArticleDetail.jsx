import React, { PropTypes } from 'react';

export default class ArticleDetail extends React.Component {

  renderArticle() {
    const { articleData } = this.props;
    console.log('this.props: ', this.props);
    return (
      <div>
        <div>
          {articleData.title}
        </div>
        <div>
          {articleData.summary}
        </div>
        <div>
          {articleData.content}
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
