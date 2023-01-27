import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import {
  FieldStyle,
  SectionBodyItem,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';

import { IBuilding } from '../../../types';

export type Props = {
  title?: string;
  buildings: IBuilding[];
};

export default function Component({ buildings, title = '' }: Props) {
  const renderBody = buildings => {
    if (!buildings || !buildings.length) {
      return <EmptyState icon="user-6" text="No data" />;
    }

    const renderRow = (label, value) => {
      return (
        <li>
          <FieldStyle>{__(`${label}`)}</FieldStyle>
          <SidebarCounter>{value || '-'}</SidebarCounter>
        </li>
      );
    };

    return (
      <div>
        {buildings.map((building, index) => (
          <SectionBodyItem key={index}>
            <Link
              to={`/mobinet/building/details/${building._id}`}
              target="_blank"
            >
              <SidebarList className="no-link">
                <Icon icon="building" />
                {renderRow('Аймаг/Хот', building.quarter.district.city.name)}
                {renderRow('Сум/Дүүрэг', building.quarter.district.name)}
                {renderRow('Хороо/Баг', building.quarter.name)}
                {renderRow('Name', building.name)}
              </SidebarList>
            </Link>
          </SectionBodyItem>
        ))}
      </div>
    );
  };

  return (
    <Box
      title={__(`${title || 'Related Buildings'}`)}
      isOpen={false}
      name="showBuildings"
    >
      {renderBody(buildings)}
    </Box>
  );
}
