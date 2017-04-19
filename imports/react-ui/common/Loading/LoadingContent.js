import React, { PropTypes } from 'react';
import { _ } from 'meteor/underscore';

const propTypes = {
  items: PropTypes.number.isRequired,
  isTable: PropTypes.bool,
};

function LoadingContent({ items, isTable }) {
  return isTable ? <TableRow items={items} /> : <Row items={items} />;
}

function Row({ items }) {
  return (
    <div>
      {_.times(items, n => (
        <div key={n} className="loading-item bordered">
          <div className="circle animate" />
          <div className="line-wrapper">
            <div className="line width20 animate" />
            <div className="line width70 animate" />
            <div className="line width40 animate" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableRow({ items }) {
  const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  return (
    <tbody>
      {_.times(items, n => (
        <tr key={n}>
          <td className="less-space">
            <div className="circle animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
          <td>
            <div style={{ width: `${getRandom(60, 100)}%` }} className="line animate" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

TableRow.propTypes = {
  items: PropTypes.number.isRequired,
};
Row.propTypes = {
  items: PropTypes.number.isRequired,
};

LoadingContent.propTypes = propTypes;

export default LoadingContent;
