import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import BuildingForm from '../containers/Form';

import { IBuilding } from '../types';

type Props = {
  history: any;
  building: IBuilding;
  remove: (buildingId: string) => void;
};

const Row = (props: Props) => {
  const { building, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(building._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="buildingDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const renderEditAction = () => {
    return (
      <Tip text={__('Edit')} placement="top">
        <Button
          id="buildingEdit"
          btnStyle="link"
          icon="edit"
          onClick={() => {
            props.history.push(`/mobinet/building/details/${building._id}`);
          }}
        />
      </Tip>
    );
  };

  const formContent = props => <BuildingForm {...props} building={building} />;

  const center = building.location || {
    lat: 0,
    lng: 0,
    description: 'description'
  };

  const cityName =
    (building.quarter &&
      building.quarter.district &&
      building.quarter.district.city.name) ||
    '-';

  const districtName =
    (building.quarter &&
      building.quarter.district &&
      building.quarter.district.name) ||
    '-';

  const quarterName = (building.quarter && building.quarter.name) || '-';

  const installationRequestIds = building.installationRequestIds || [];
  const ticketIds = building.ticketIds || [];

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{building.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{building.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lat || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lng || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{cityName}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{districtName}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{quarterName}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{building.networkType || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{installationRequestIds.length}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{ticketIds.length}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          {renderEditAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
