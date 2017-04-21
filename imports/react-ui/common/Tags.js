import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';

const SIZES = ['small', 'medium', 'large'];

const propTypes = {
  tags: PropTypes.array.isRequired,
  size: PropTypes.oneOf(SIZES),
};

function Tags({ tags, size }) {
  return (
    <div className="tags">
      {tags.map(tag => (
        <Label key={tag.name} style={{ backgroundColor: tag.colorCode }} className={size}>
          {tag.name}
        </Label>
      ))}
    </div>
  );
}

Tags.propTypes = propTypes;

export default Tags;
