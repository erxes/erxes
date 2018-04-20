import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  category: PropTypes.object.isRequired,
};

const contextTypes = {
  __: PropTypes.func
};

function ItemMeta({ category }, {__}) {
  const { authors } = category;
  let text = '';

  function renderAvatars() {
    return authors.map(author =>
      <img
        alt={author.details.fullName}
        key={author.details.fullName}
        src={author.details.avatar || '/static/images/userDefaultIcon.png'}
      />,
    );
  }

  if (authors.length >= 1) {
    text = authors[0].details.fullName;
  }

  if (authors.length >= 2) {
    text += `, ${authors[1].details.fullName}`;
  }

  if (authors.length >= 3) {
    text += `, ${authors[2].details.fullName}`;
  }

  if (authors.length >= 4) {
    text += ` and ${authors.length - 3} people`;
  }

  return (
    <div className="item-meta flex-item">
      <div className="avatars">
        {renderAvatars()}
      </div>
      <div>
        <div>
          {__('There are ')} <span>{category.numOfArticles}</span> {__('articles in this category')}
        </div>
        <div>
          {__('Written by')} <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

ItemMeta.propTypes = propTypes;
ItemMeta.contextTypes = contextTypes;

export default ItemMeta;
