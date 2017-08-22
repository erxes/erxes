import React, { PropTypes } from 'react';


const propTypes = {
  onChangeHandler: PropTypes.func.isRequired,
};

function Searchbar({ onChangeHandler }) {
  return (
    <div className="erxes-searchbar">
      <div className="erxes-knowledge-container">
        <input onChange={onChangeHandler} />
      </div>
    </div>
  );
}

Searchbar.propTypes = propTypes;

export default Searchbar;
