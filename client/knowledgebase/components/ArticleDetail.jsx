import React, { PropTypes } from 'react';
import moment from 'moment';

export default function ArticleDetail({ data }) {
  const author = data.authorDetails;
  return (
    <div className="erxes-kb-item detail">
      <h1>{data.title}</h1>
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
            {data.modifiedDate ? 'Modified ' : 'Created '}
            {moment(data.modifiedDate ? data.modifiedDate : data.createdDate).fromNow()}
          </div>
        </div>
      </div>
      <div className="erxes-article-content">
        <p>{data.summary}</p>
        <p>{data.content}</p>
      </div>
    </div>
  );
}

ArticleDetail.propTypes = {
  data: PropTypes.object, // eslint-disable-line
};
