import React, { PropTypes } from 'react';

export default class ArticleDetail extends React.Component {

  renderArticle() {
    const { data } = this.props;
    return (
      <div>
        <div>
          {data.title}
        </div>
        <div>
          {data.summary}
        </div>
        <div>
          {data.content}
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
