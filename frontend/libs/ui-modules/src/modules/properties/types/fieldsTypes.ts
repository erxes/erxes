export type IField = {
  _id: string;
  name: string;
  code: string;
  selectOptions?: Array<{ label: string; value: string | number }>;
  type?: string;
  group?: string;
  value: string;
  label: string;
  options?: string[];
  validation?: string;
  choiceOptions?: string[];
  selectionConfig?: {
    queryName: string;
    selectionName: string;
    valueField: string;
    labelField: string;
    multi?: boolean;
  };
  groupDetail?: any;
  icon?: string;
};
