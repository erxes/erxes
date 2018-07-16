import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { BackButton } from './';
import { defaultAvatar } from '../../icons/Icons';

const propTypes = {
  article: PropTypes.object,
  goToArticles: PropTypes.func,
};

const contextTypes = {
  __: PropTypes.func
};

export default function ArticleDetail({ article, goToArticles }, {__}) {
  const { author, modifiedDate, createdDate, title, summary, content } = article;

  return (
    <div>
      <BackButton
        onClickHandler={goToArticles}
        text={__('Back to articles')}
      />
      <div className="erxes-kb-item detail">
        <h1>{title}</h1>
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
              {modifiedDate ? __('Modified ') : __('Created ')}
              <span>
                {moment(modifiedDate ? modifiedDate : createdDate).format('lll')}
              </span>
            </div>
          </div>
        </div>
        <div className="erxes-article-content">
          <p>{summary}</p>
          <p dangerouslySetInnerHTML={{__html: content}}/>
        </div>
      </div>
    </div>
  );
}

ArticleDetail.propTypes = propTypes;
ArticleDetail.contextTypes = contextTypes;
