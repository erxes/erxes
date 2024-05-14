import { __, FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';
import React from 'react';
import { Description } from '../../styles';
import { ICar } from '../../types';

type Props = {
  car: ICar;
};

const DetailInfo = (props: Props) => {
  const { car } = props;

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  const renderColor = (colorCode) => {
    return (
      <li>
        <FieldStyle>{__(`Color`)}</FieldStyle>
        <SidebarCounter
          style={{ backgroundColor: colorCode, width: 30, height: 15 }}
        />
      </li>
    );
  };

  return (
    <SidebarList className="no-link">
      {renderRow('Plate number', car.plateNumber)}
      {renderRow('VIN number', car.vinNumber)}
      {renderRow('Category', car.category ? car.category.name : 'Unknown')}
      {renderColor(car.colorCode)}
      {renderRow('Vintage Year', car.vintageYear)}
      {renderRow('Import Year', car.importYear)}
      {renderRow('Body Type', car.bodyType)}
      {renderRow('Fuel Type', car.fuelType)}
      {renderRow('Gear Box', car.gearBox)}
      {renderRow(
        'Owner',
        car.ownerId
          ? (car.owner.details && car.owner.details.fullName) || car.owner.email
          : '-',
      )}
      <li>
        <FieldStyle>{__(`Description`)}</FieldStyle>
      </li>
      <Description
        dangerouslySetInnerHTML={{
          __html: car.description || '',
        }}
      />
    </SidebarList>
  );
};

export default DetailInfo;
