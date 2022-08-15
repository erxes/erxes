import {
  CollapseContent,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { ICar } from '../../../types';

type Props = {
  cars: ICar[];
};

const CarSection = (props: Props) => {
  const { Section } = Sidebar;
  const { cars } = props;

  if (!cars || !cars.length) {
    return null;
  }

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || 'NA'}</SidebarCounter>
      </li>
    );
  };

  return (
    <Sidebar.Section>
      <CollapseContent title={`${__('Vehicles')}`} compact={true} open={false}>
        {cars.map(car => (
          <Section>
            <SidebarList className="no-link">
              {renderRow('Model', car.carModel)}
              {renderRow('Category', car.category?.name)}
              {renderRow('Vin number', car.vinNumber)}
              {renderRow('Plate number', car.plateNumber)}
            </SidebarList>
          </Section>
        ))}
      </CollapseContent>

      {/* {this.renderAction()} */}
    </Sidebar.Section>
  );
};

export default CarSection;
