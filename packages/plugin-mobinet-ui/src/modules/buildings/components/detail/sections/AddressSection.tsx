import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import React from 'react';
import OSMap from '../../../../../common/OSMap';
import { renderCompanyName } from '../../../../../utils';

import { IBuilding } from '../../../types';

type Props = {
  building: IBuilding;
  children?: React.ReactNode;
};

const IntoSection = (props: Props) => {
  const { Section } = Sidebar;
  const { building } = props;

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  return (
    <Sidebar.Section>
      <Section>
        <SidebarList className="no-link">
          {renderRow('Аймаг/Хот', building.quarter.district.city.name)}
          {renderRow('Сум/Дүүрэг', building.quarter.district.name)}
          {renderRow('Хороо/Баг', building.quarter.name)}
          {renderRow('СӨХ', building.suh && renderCompanyName(building.suh))}
        </SidebarList>
        <OSMap
          id={Math.random().toString(10)}
          width={'100%'}
          height={'250px'}
          center={building.location}
          zoom={16}
          addMarkerOnCenter={true}
        />
      </Section>
    </Sidebar.Section>
  );
};

export default IntoSection;
