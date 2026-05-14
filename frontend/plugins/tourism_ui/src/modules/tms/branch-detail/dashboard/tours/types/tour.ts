export interface ITour {
  _id: string;
  name?: string;
  refNumber?: string;
  groupCode?: string;
  dateType?: 'fixed' | 'flexible';
  startDate?: string;
  endDate?: string;
  availableFrom?: string;
  availableTo?: string;
  status?: string;
  date_status?: string;
  cost?: number;
  customTourTypeId?: string;
  customFieldsData?: any[];
  createdAt?: string;
  categoryIds?: string[];
}

export interface ITourGroup {
  _id: string;
  name?: string;
  items: ITour[];
}
