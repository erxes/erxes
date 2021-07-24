export type IAction = {
  id: number;
  type: string;
  nextActionId?: string;
  style?: any;
  config?: any;
};

export type ITrigger = {
  id: number;
  type: string;
  actionId?: string;
  style?: any;
};
