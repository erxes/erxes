import React, { PropTypes } from 'react';

const propTypes = {
  category: PropTypes.object.isRequired,
};

function ItemMeta({ category }) {
  const authors = category.authors;
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
          There are {category.numOfArticles} articles in this category
        </div>
        <div>
          Written by <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

ItemMeta.propTypes = propTypes;

export default ItemMeta;
