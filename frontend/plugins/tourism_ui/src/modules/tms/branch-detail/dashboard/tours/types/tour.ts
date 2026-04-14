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
  createdAt?: string;
  categoryIds?: string[];
}

export interface ITourGroup {
  _id: string;
  items: ITour[];
}
