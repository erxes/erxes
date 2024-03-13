export type IAction = {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  description?: string;
  nextActionId?: string;
  isAvailable?: boolean;
  style?: any;
  config?: any;
  position?: any;
  isAvailableOptionalConnect?: boolean;

  count?: number;
};
