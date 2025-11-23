export interface EBarimtFormData {
  CompanyName: string;
  EbarimtUrl: string;
  CheckTaxpayerUrl: string;
  FieldGroup: string;
  BillTypeChooser: string;
  RegNoInput: string;
  CompanyNameResponse: string;
}

export interface DealBillType {
  groupId: string;
  billType: string;
  regNoField: string;
  companyNameField: string;
}

export interface EBarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;
  dealBillType: DealBillType;
}

export interface Field {
  _id: string;
  name: string;
  text: string;
  type: string;
  code?: string;
  description?: string;
  isRequired?: boolean;
  options?: string[];
  isVisible?: boolean;
}

export interface FieldGroup {
  _id: string;
  name: string;
  description?: string;
  code?: string;
  contentType: string;
  fields: Field[];
}

export interface StaticFieldOption {
  value: string;
  label: string;
}

export const FIELD_GROUP_OPTIONS: StaticFieldOption[] = [
  { value: 'empty', label: 'Empty' },
  { value: 'basic', label: 'Basic information' },
  { value: 'relations', label: 'sales:deal:relations-Relations' },
];

export const getFieldDependentOptions = (
  fieldGroup: string,
  fieldName: string,
) => {
  const emptyOptions = [{ value: 'empty', label: 'Empty' }];

  const basicInfoOptions = [
    { value: 'empty', label: 'Empty' },
    { value: 'closeDate', label: 'Close date' },
    { value: 'startDate', label: 'Start date' },
    { value: 'label', label: 'Label' },
    { value: 'description', label: 'Description' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignedTo', label: 'Assigned to' },
    { value: 'branches', label: 'Branches' },
    { value: 'tags', label: 'Tags' },
    { value: 'department', label: 'Department' },
  ];

  const relationsOptions = [{ value: 'empty', label: 'Empty' }];

  switch (fieldGroup) {
    case 'basic':
      return basicInfoOptions;
    case 'relations':
      return relationsOptions;
    default:
      return emptyOptions;
  }
};
