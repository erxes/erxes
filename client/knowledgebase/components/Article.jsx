import React, { PropTypes } from 'react';

export default class Article extends React.Component {

  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();
    const { article } = this.props;
    const { category } = this.props;
    const { onSwitchToArticleDisplay } = this.props;
    onSwitchToArticleDisplay({
      _id: article._id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category,
    });
  }

  renderArticle() {
    const { article } = this.props;
    return (
      <a href="" className="erxes-article" onClick={this.handleOnClick}>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
      </a>
    );
  }

  render() {
    return this.renderArticle();
  }
}

Article.propTypes = {
  article: PropTypes.object, // eslint-disable-line
  category: PropTypes.object, // eslint-disable-line
  onSwitchToArticleDisplay: PropTypes.func // eslint-disable-line
};
