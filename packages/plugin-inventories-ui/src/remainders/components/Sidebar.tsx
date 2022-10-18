import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
// erxes
import { __, router } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Box from '@erxes/ui/src/components/Box';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
// local
import CategoryFilter from '../containers/CategoryFilter';
import { SidebarContent } from '../../styles';

export default function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <CategoryFilter />
    </Wrapper.Sidebar>
  );
}
