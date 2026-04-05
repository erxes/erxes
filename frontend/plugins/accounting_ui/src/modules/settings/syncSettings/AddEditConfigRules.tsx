import { SyncDealConfigForm } from './SyncDealConfigForm';
import { SyncOrderConfigForm } from './SyncOrderConfigFrom';
import { SyncDealReturnConfigForm } from './SyncDealConfigReturnForm';
import {  UseFormReturn } from 'react-hook-form';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';

type SettingsRule = {
  subIdFieldName: string;
  FormComponent: React.ComponentType<{
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    loading: boolean;
  }>;
};

export const SettingsRuleByCode: Record<ACCOUNTING_SETTINGS_CODES, SettingsRule> = {
  syncDeal: {
    subIdFieldName: 'stageId',
    FormComponent: SyncDealConfigForm,
  },
  syncDealReturn: {
    subIdFieldName: 'stageId',
    FormComponent: SyncDealReturnConfigForm,
  },
  syncOrder: {
    subIdFieldName: 'posId',
    FormComponent: SyncOrderConfigForm,
  },
};