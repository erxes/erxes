import React, { PropTypes } from 'react';

export default function ArticleDetail({ data }) {
  return (
    <div className="erxes-kb-item detail">
      <h1>{data.title}</h1>
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
