import { Icon } from "@tabler/icons-react";

export interface FilterItem {
  key: string;
  icon: Icon;
  value: string;
}

export type SalesFilterState = {
  search?: string | null;             
  companyIds?: string[] | null;       
  customerIds?: string[] | null;
  userIds?: string[] | null;   
  branchIds?: string[] | null;   
  departmentIds?: string[] | null;   
  assignedUserIds?: string[] | null;  
  createdStartDate?: string | null;   
  createdEndDate?: string | null;     
  startDateStartDate?: string | null; 
  startDateEndDate?: string | null;   
  priority?: string[] | null;         
  labelIds?: string[] | null;         
  tagIds?: string[] | null;           
  awaiting?: boolean | null;          
  advanced?: Record<string, any> | null; 
};
