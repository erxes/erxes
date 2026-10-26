export interface NotificationFilters {
  status?: string;
  priority?: string;
  type?: string;
  fromDate?: string;
  endDate?: string;
  module?: string;
  plugin?: string;
  fromUserId?: string;
  ids?: string[];
  unreadFirst?: boolean;
}
