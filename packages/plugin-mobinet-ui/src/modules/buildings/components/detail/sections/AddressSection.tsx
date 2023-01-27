import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import React from 'react';

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
          {/* {renderRow('Name', building.name)} */}
          {renderRow('City', building.quarter.district.city.name)}
          {renderRow('District', building.quarter.district.name)}
          {renderRow('Quarter', building.quarter.name)}
        </SidebarList>
      </Section>
    </Sidebar.Section>
  );
};

export default IntoSection;
