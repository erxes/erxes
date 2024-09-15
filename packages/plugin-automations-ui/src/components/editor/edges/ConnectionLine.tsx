import React from 'react';

const checkIsOptionalConnect = (id = '') => {
  const hasTwoHyphens = id.split('-').length - 1 === 2;

  const endsWithRight = id.endsWith('right');

  return hasTwoHyphens && endsWithRight;
};

const ConnectionLine = ({ fromX, fromY, toX, toY, ...props }) => {
  const { fromHandle = {} } = props;

  const isOptionalConnect = checkIsOptionalConnect(fromHandle?.id);

  return (
    <g>
      <path
        fill="none"
        stroke={isOptionalConnect ? 'rgb(136, 136, 136)' : 'rgb(101, 105, 223)'}
        className={isOptionalConnect ? 'animated' : ''}
        strokeWidth={2}
        d={`M${fromX},${fromY} C${fromX + 50},${fromY} ${toX - 50},${toY} ${toX},${toY}`}
      />

      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={10}
        stroke="rgb(247, 206, 83)"
        strokeWidth={4}
      />
    </g>
  );
};

export default ConnectionLine;
