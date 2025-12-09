export type IField = {
  _id: string;
  name: string;
  code: string;
  options?: Array<{ label: string; value: string | number }>;
  type?: string;
  group?: string;
  logics?: Record<string, any>;
  relationType?: string;
  multiple?: boolean;
  icon?: string;
};
