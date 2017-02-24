import React, { PropTypes } from 'react';
import { _ } from 'meteor/underscore';


const propTypes = {
  items: PropTypes.number.isRequired,
  isTable: PropTypes.bool,
};

function LoadingContent({ items, isTable }) {
  return (
    <div>
      {_.times(items, (n) => {
        if (isTable) {
          return <TableRow key={n} />;
        }
        return <Row key={n} />;
      },
    )}
    </div>
  );
}

function Row() {
  return (
    <div className="loading-item bordered">
      <div className="circle animate" />
      <div className="line-wrapper">
        <div className="line width20 animate" />
        <div className="line width85 animate" />
        <div className="line width65 animate" />
        <div className="line width40 animate" />
      </div>
    </div>
  );
}

function TableRow() {
  // todo
  return (
    <div className="loading-item bordered">
      <div className="line-wrapper">
        <div className="line width20 animate" />
        <div className="line width85 animate" />
        <div className="line width65 animate" />
        <div className="line width40 animate" />
      </div>
    </div>
  );
}

LoadingContent.propTypes = propTypes;

export default LoadingContent;
