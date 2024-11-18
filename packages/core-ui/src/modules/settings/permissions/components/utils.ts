import { IUserGroup } from '@erxes/ui-settings/src/permissions/types';
import { IActions, IModule } from '../types';

export type generatedList = {
  value: string;
  label?: string;
};

export const generateModuleParams = (list: IModule[] | IActions[]): generatedList[] => {
  const sortedList = [...list].sort((a, b) => {
    return (a.description || '').localeCompare(b.description || '');
  });

  return sortedList.map(item => ({
    value: item.name,
    label: item.description
  }));
};

export const generateListParams = (items: IUserGroup[]): generatedList[] => {
  return items.map(item => ({
    value: item._id,
    label: item.name
  }));
};

export const correctValue = (data: generatedList): string => {
  return data ? data.value : '';
};

export const filterActions = (actions: IActions[], moduleName: string) => {
  if (!moduleName) {
    return [];
  }

  const moduleActions = actions.filter(a => a.module === moduleName) || [];

  return generateModuleParams(moduleActions);
};
