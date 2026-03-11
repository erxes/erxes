export interface ITour {
  _id: string;
  name?: string;
  refNumber?: string;
  groupCode?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  date_status?: string;
  cost?: number;
  createdAt?: string;
}

export interface ITourGroup {
  _id: string;
  items: ITour[];
}
