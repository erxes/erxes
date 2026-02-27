import { useLocation } from 'react-router-dom';
import { SETTINGS_ROUTES } from '../constants/structure-routes';
import { BranchesTopbar } from './branches/BranchesTopbar';
import { DepartmentsTopbar } from './departments/DepartmentsTopbar';
import { UnitsTopbar } from './units/UnitsTopbar';
import { PositionsTopbar } from './positions/PositionsTopbar';

export function StructureTopbar() {
  const { pathname } = useLocation();

  if (pathname === '/settings/structure') {
    return null;
  }

  const currentRoute =
    SETTINGS_ROUTES[pathname as keyof typeof SETTINGS_ROUTES];

  if (currentRoute === 'Branches') {
    return <BranchesTopbar />;
  }

  if (currentRoute === 'Departments') {
    return <DepartmentsTopbar />;
  }
  if (currentRoute === 'Units') {
    return <UnitsTopbar />;
  }
  if (currentRoute === 'Positions') {
    return <PositionsTopbar />;
  }

  return null;
}
