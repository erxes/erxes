import React from 'react';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import { IDirection } from '../../types';
import { ROAD_CONDITIONS } from '../../constants';

type Props = {
  direction: IDirection;
};

const Row = (props: Props) => {
  const { direction } = props;

  const { roadConditions } = direction;
  let conditionString = '';

  for (const c of roadConditions) {
    conditionString += ROAD_CONDITIONS[c] + ', ';
  }

  conditionString = conditionString.slice(0, -2);

  return (
    <tr>
      <td key={direction.placeA.code}>
        <RowTitle>{direction.placeA.name || '-'}</RowTitle>
      </td>

      <td key={direction.placeB.code}>
        <RowTitle>{direction.placeB.name || '-'}</RowTitle>
      </td>

      <td key={Math.random().toString()}>
        <RowTitle>{conditionString}</RowTitle>
      </td>

      <td key={direction.duration}>
        <RowTitle>{direction.duration || '0'}</RowTitle>
      </td>

      <td key={direction.totalDistance}>
        <RowTitle>{direction.totalDistance || '0'}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
