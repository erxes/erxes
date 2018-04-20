import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const propTypes = {
  data: PropTypes.object, // eslint-disable-line
};

const contextTypes = {
  __: PropTypes.func
};

export default function ArticleDetail({ data }, {__}) {
  const { author } = data;
  return (
    <div className="erxes-kb-item detail">
      <h1>{data.title}</h1>
      <div className="item-meta flex-item">
        <div className="avatars">
          <img
            alt={author.details.fullName}
            src={author.details.avatar || '/static/images/default-avatar.svg'}
          />
        </div>
        <div>
          <div>
            {__('Written by')}: <span>{author.details.fullName}</span>
          </div>
          <div>
            {data.modifiedDate ? __('Modified ') : __('Created ')}
            <span>
              {moment(data.modifiedDate ? data.modifiedDate : data.createdDate).format('lll')}
            </span>
          </div>
        </div>
      </div>
      <div className="erxes-article-content">
        <p>{data.summary}</p>
        <p dangerouslySetInnerHTML={{__html: data.content}}/>
      </div>
    </div>
  );
}

ArticleDetail.propTypes = propTypes;
ArticleDetail.contextTypes = contextTypes;
