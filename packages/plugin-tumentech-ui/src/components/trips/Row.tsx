import { RowTitle } from '@erxes/ui-engage/src/styles';
import { formatValue, renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ITrip } from '../../types';
import { carInfo } from '../../utils';

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

  let name = trip.route ? trip.route.name || '-' : '-';

  for (const { dealPlace } of trip.deals) {
    if (!dealPlace) {
      continue;
    }

    name = `${dealPlace.startPlace.province}: ${dealPlace.startPlace.name} - ${dealPlace.endPlace.province}: ${dealPlace.endPlace.name}`;
  }

  return (
    <tr id={trip._id} onClick={onClickRow}>
      <td key={Math.random()}>
        <RowTitle>{name}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.status || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{formatValue(renderFullName(trip.driver))} </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>
          {trip.cars.length ? `${trip.cars.map(c => carInfo(c))}` : 'undefined'}
        </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.deals.map(d => d && d.name)}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{trip.createdAt}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
