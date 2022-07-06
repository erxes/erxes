import React from 'react';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import { ITrip } from '../../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { formatValue, renderFullName, __ } from '@erxes/ui/src/utils/core';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PlaceForm from '../../containers/places/Form';
import { useHistory } from 'react-router-dom';

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

      {/* <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit place'}
            trigger={<Button btnStyle="link" icon="edit-3" />}
            content={formContent}
            size={'lg'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td> */}
    </tr>
  );
};

export default Row;
