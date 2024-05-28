import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import BuildingForm from '../containers/Form';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import { IBuilding } from '../types';
import { Icon, Label, ModalTrigger } from '@erxes/ui/src';
import { useNavigate } from 'react-router-dom';

type Props = {
  index: number;
  building: IBuilding;
  remove: (buildingId: string) => void;
};

const Row = (props: Props) => {
  const { building, remove } = props;
  const navigate = useNavigate();

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(building._id);
    };

    return (
      <Tip text={__('Delete')} placement='top'>
        <Button
          id='buildingDelete'
          btnStyle='link'
          onClick={onClick}
          icon='times-circle'
        />
      </Tip>
    );
  };

  const renderEditAction = () => {
    return (
      <Tip text={__('Edit')} placement='top'>
        <Button
          id='buildingEdit'
          btnStyle='link'
          icon='edit'
          onClick={() => {
            navigate(`/mobinet/building/details/${building._id}`);
          }}
        />
      </Tip>
    );
  };

  const formContent = props => <BuildingForm {...props} building={building} />;

  const center = building.location || {
    lat: 0,
    lng: 0,
    description: 'description',
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
  const onClick = () => {
    navigate(`/mobinet/building/details/${building._id}`);
  };

  let statusText = 'Сүлжээ нэвтрээгүй';

  switch (building.serviceStatus) {
    case 'active':
      statusText = 'Сүлжээ нэвтэрсэн';
      break;
    case 'inactive':
      statusText = 'Сүлжээ нэвтрээгүй';
      break;
    case 'inprogress':
      statusText = 'Нэвтрүүлэлт хийгдэж буй';
      break;
    case 'unavailable':
      statusText = 'Боломжгүй';
      break;

    default:
      statusText = 'Сүлжээ нэвтрээгүй';
      break;
  }

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle onClick={onClick}>{props.index}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle onClick={onClick}>{building.name || '-'}</RowTitle>
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
        <RowTitle>{installationRequestIds.length}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{ticketIds.length}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{building.networkType || '-'}</RowTitle>
      </td>
      <td key={Math.random()}>
        <Label lblColor={building.color} ignoreTrans={true}>
          <span>{statusText}</span>
        </Label>
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
