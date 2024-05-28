import {
  CollapseContent,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  driver: ICustomer;
};

const DriverSection = (props: Props) => {
  const { Section } = Sidebar;
  const { driver } = props;

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
      <CollapseContent title={`${__('Driver')}`} compact={true} open={false}>
        <Section>
          <SidebarList className="no-link">
            {renderRow('Name', driver.firstName)}
            {renderRow('Phone', driver.primaryPhone)}
          </SidebarList>
        </Section>
      </CollapseContent>

      {/* {this.renderAction()} */}
    </Sidebar.Section>
  );
};

export default DriverSection;
