export type commonRefetchType = {
  searchValue?: string;
  perPage?: number;
  sortDirection?: number;
  sortFromDate?: string;
  sortToDate?: string;
};

export interface ICommonListProps {
  objects: any;
  history: any;
  remove: (_ids: string[]) => void;
  save: () => void;
  refetch: () => void;
  loading: boolean;
}

export type CustomFormGroupProps = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
};

type IFormDetailType = {
  fields: any[];
  indicators: any[];
  indicatorId: string;
  indicator: any;
  submissions: {
    [key: string]: string;
  };
  formId: string;
};
export type IRiskFormDetailQueryResponse = {
  riskConformityFormDetail: IFormDetailType;
  loading: boolean;
  refetch: () => void;
};
