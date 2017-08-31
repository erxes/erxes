import React from 'react';
import PropTypes from 'prop-types';
import { Category } from '../containers';

const propTypes = {
  kbTopic: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,

    categories: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      icon: PropTypes.string,
      authors: PropTypes.arrayOf(PropTypes.shape({
        details: PropTypes.shape({
          fullName: PropTypes.string,
          avatar: PropTypes.string,
        }),
        articleCount: PropTypes.string,
      })),
      numOfArticles: PropTypes.string,
      articles: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        summary: PropTypes.string,
        content: PropTypes.string,
        createdBy: PropTypes.string,
        modifiedBy: PropTypes.string,
        createdDate: PropTypes.date,
        modifiedDate: PropTypes.date,
        authorDetails: PropTypes.shape({
          fullName: PropTypes.string,
          avatar: PropTypes.string,
        }),
      })),
    })),
  }),
};

export default function Categories({ kbTopic }) {
  return (
    <div>
      {kbTopic.categories.map(category => <Category key={category._id} category={category} />)}
    </div>
  );
}

Categories.propTypes = propTypes;
