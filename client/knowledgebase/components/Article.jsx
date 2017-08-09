import React, { PropTypes } from 'react';

export default class Article extends React.Component {

  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();
    const { article } = this.props;
    const { onSwitchToArticleDisplay } = this.props;
    console.log('article._id: ', article._id);
    onSwitchToArticleDisplay({
      _id: article._id,
      title: article.title,
      summary: article.summary,
      content: article.content,
    });
  }

  renderArticle() {
    const { article } = this.props;
    return (
      <div>
        <div>
          <a href="" onClick={this.handleOnClick}>{article.title}</a>
        </div>
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
  onSwitchToArticleDisplay: PropTypes.func
};
