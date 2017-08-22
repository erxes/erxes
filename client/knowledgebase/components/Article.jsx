import React, { PropTypes } from 'react';
import moment from 'moment';

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
      authorDetails: article.authorDetails,
      createdDate: article.createdDate,
      modifiedDate: article.modifiedDate,
      category,
    });
  }

  render() {
    const { article } = this.props;
    const author = article.authorDetails;

    return (
      <a href="" className="erxes-kb-item" onClick={this.handleOnClick}>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
        <div className="item-meta flex-item">
          <div className="avatars">
            <img
              alt={author.fullName}
              src={author.avatar || '/static/images/userDefaultIcon.png'}
            />
          </div>
          <div>
            <div>
              Written by <span>{author.fullName}</span>
            </div>
            <div>
              {article.modifiedDate ? 'Modified ' : 'Created '}
              {moment(article.modifiedDate ? article.modifiedDate : article.createdDate).fromNow()}
            </div>
          </div>
        </div>
      </a>
    );
  }
}

Article.propTypes = {
  article: PropTypes.object, // eslint-disable-line
  category: PropTypes.object, // eslint-disable-line
  onSwitchToArticleDisplay: PropTypes.func // eslint-disable-line
};
