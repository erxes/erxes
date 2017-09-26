import React from 'react';
import PropTypes from 'prop-types';
import { Category } from '../containers';

const propTypes = {
  kbTopic: PropTypes.object,
};

export default function Categories({ kbTopic }) {
  return (
    <div>
      {kbTopic.categories.map(category => <Category key={category._id} category={category} />)}
    </div>
  );
}

Categories.propTypes = propTypes;
