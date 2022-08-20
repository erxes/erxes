import { __, FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src';
import React from 'react';
import { Description } from '../../styles';
import { ICar } from '../../types';

type Props = {
  car: ICar;
};

class DetailInfo extends React.Component<Props> {
  renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  renderColor = colorCode => {
    return (
      <li>
        <FieldStyle>{__(`Color`)}</FieldStyle>
        <SidebarCounter
          style={{ backgroundColor: colorCode, width: 30, height: 15 }}
        />
      </li>
    );
  };

  render() {
    const { car } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Plate number', car.plateNumber)}
        {this.renderRow('VIN number', car.vinNumber)}
        {this.renderRow(
          'Category',
          car.category ? car.category.name : 'Unknown'
        )}
        {this.renderColor(car.colorCode)}
        {this.renderRow('Vintage Year', car.vintageYear)}
        {this.renderRow('Import Year', car.importYear)}
        {this.renderRow('Body Type', car.bodyType)}
        {this.renderRow('Fuel Type', car.fuelType)}
        {this.renderRow('Gear Box', car.gearBox)}
        {this.renderRow(
          'Owner',
          car.ownerId
            ? (car.owner.details && car.owner.details.fullName) ||
                car.owner.email
            : '-'
        )}
        <li>
          <FieldStyle>{__(`Description`)}</FieldStyle>
        </li>
        <Description
          dangerouslySetInnerHTML={{
            __html: car.description
          }}
        />
      </SidebarList>
    );
  }
}

export default DetailInfo;
