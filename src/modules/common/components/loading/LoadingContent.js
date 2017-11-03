import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {
  LoadingItem,
  LoadingItemCircle,
  LineWrapper,
  Line,
  LoadingTableCircle,
  TableLine
} from './styles';

const propTypes = {
  items: PropTypes.number.isRequired,
  isTable: PropTypes.bool
};

function LoadingContent({ items, isTable }) {
  return isTable ? <TableRow items={items} /> : <Row items={items} />;
}

function Row({ items }) {
  return (
    <div>
      {_.times(items, n => (
        <LoadingItem key={n} className="bordered">
          <LoadingItemCircle className="animate" />
          <LineWrapper>
            <Line className="width20 animate" />
            <Line className="width70 animate" />
            <Line className="width40 animate" />
          </LineWrapper>
        </LoadingItem>
      ))}
    </div>
  );
}

function TableRow({ items }) {
  const getRandom = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  return (
    <tbody>
      {_.times(items, n => (
        <tr key={n}>
          <td className="less-space">
            <LoadingTableCircle className="animate" />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
          <td>
            <TableLine
              style={{ width: `${getRandom(60, 100)}%` }}
              className="animate"
            />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

TableRow.propTypes = {
  items: PropTypes.number.isRequired
};
Row.propTypes = {
  items: PropTypes.number.isRequired
};

LoadingContent.propTypes = propTypes;

export default LoadingContent;
