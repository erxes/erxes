import React, { PropTypes } from 'react';

const propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  size: PropTypes.string,
};

function EmptyState({ text, icon, size }) {
  const classNames = `empty-state ${size}`;
  return (
    <div className={classNames}>
      {icon}
      {text}
    </div>
  );
}

EmptyState.propTypes = propTypes;

export default EmptyState;
