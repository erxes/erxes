import { RowTitle } from '@erxes/ui-engage/src/styles';
import { formatValue, renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ITrip } from '../../types';

type Props = {
  trip: ITrip;
};

const Row = (props: Props) => {
  const { trip } = props;
  let historyObj = useHistory();

  const onClickRow = e => {
    historyObj.push(
      `/erxes-plugin-tumentech/trips/detail/${e.currentTarget.id}`
    );
  };

  return (
    <tr id={trip._id} onClick={onClickRow}>
      <td key={Math.random()}>
        <RowTitle>{trip.route.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.status || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{formatValue(renderFullName(trip.driver))} </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{`${trip.car.plateNumber} - ${trip.car.carModel}`}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.deals.map(d => d.name)}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.createdAt}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
