import { type Icon } from '@tabler/icons-react';
import { TabType } from '../../types';

export enum ETabVariant {
  FLUID = 'fluid',
  PILL = 'pill',
}

export interface INavigationContextProps {
  variant: ETabVariant;
}

export interface INavigationProviderProps {
  children: React.ReactElement;
  value?: string;
}

export interface TNav {
  label: string;
  Icon: Icon;
  tab: TabType;
}
