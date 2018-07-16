import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { defaultAvatar } from '../../icons/Icons';

const propTypes = {
  article: PropTypes.object,
  onClick: PropTypes.func,
};

const contextTypes = {
  __: PropTypes.func
};

export default class Article extends React.Component {
  constructor(props) {
    super(props);

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();

    const { article, onClick } = this.props;

    onClick(article);
  }

  render() {
    const { __ } = this.context;
    const { article } = this.props;
    const { author } = article;

    return (
      <a className="erxes-kb-item" onClick={this.handleOnClick}>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
        <div className="item-meta flex-item">
          <div className="avatars">
            <img
              alt={author.details.fullName}
              src={author.details.avatar || defaultAvatar}
            />
          </div>
          <div>
            <div>
              {__('Written by')}: <span>{author.details.fullName}</span>
            </div>
            <div>
              {article.modifiedDate ? __('Modified ') : __('Created ')}
              <span>
                {moment(article.modifiedDate ? article.modifiedDate : article.createdDate).format('lll')}
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }
}

Article.propTypes = propTypes;
Article.contextTypes = contextTypes;
